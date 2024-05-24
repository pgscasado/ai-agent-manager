import { workerData, parentPort } from 'worker_threads';
import { logger } from '@root/core/logging/logger';
import { Bots, PromptUpdate, Segment } from '@root/controllers/Bots';
import { mongo } from '@root/database';
import { OpenAIModel, ai, getVectorizer } from '..';
import { getExtensionBeforeDownload } from '@root/core/text-parsing';
import { parsePDF } from '@root/core/text-parsing/pdf';
import { parseDocx } from '@root/core/text-parsing/docx';
import { parseSheet } from '@root/core/text-parsing/xlsx';
import { parseTextFile } from '@root/core/text-parsing/text';
import { DeleteResult, WithId } from 'mongodb';
import { Prisma } from '@prisma/client';
import prisma from '@root/prisma';
import axios from 'axios';

type WorkerData = {
  body: PromptUpdate,
  params: { id: string },
  query: { overload: string },
  workerId: number,
};

const languageNames = new Intl.DisplayNames(['en'], { type: 'language' });
const getLanguages = (langs: string[]) => langs?.map((lang) => languageNames.of(lang)).filter(Boolean) as string[] || [];
const defaultTrainingLanguage = 'Português brasileiro';

const urlRegex = new RegExp("(^|[ \t\r\n])((ftp|http|https|gopher|mailto|news|nntp|telnet|wais|file|prospero|aim|webcal):(([A-Za-z0-9$_.+!*(),;/?:@&~=-])|%[A-Fa-f0-9]{2}){2,}(#([a-zA-Z0-9][a-zA-Z0-9$_.+!*(),;/?:@&~=%-]*))?([A-Za-z0-9$_+!*();/?:~-]))","g");
const extractURLs = (text: string) => {
  return text.match(urlRegex)?.map(url => url.trim()) || [];
}

const jobQueue: WorkerData[] = [];
let currentJob: WorkerData | undefined = undefined;

const chunk = <Type>(size: number, list: Type[]): Type[][] =>
  list.reduce(
    (segments, _, index) =>
      index % size === 0
        ? [...segments, list.slice(index, index + size)]
        : segments,
    [] as Type[][],
  );

const train = async (data: WorkerData) => {
  const startTime = Date.now();
  const vectorizer = await getVectorizer();
  const update = data.body;
  const id = data.params.id;
  const query = data.query;
  const bot = await Bots.functions.findBot(id);
  const progressPercentage = {
    structure: 0, // 10%
    textProcessing: 0, // 10%
    segmentation: 0, // 30%
    embedding: 0, // 50%
  };
  const getPercentage = (progress: typeof progressPercentage): number => {
    return Math.round((progress.embedding * 0.5 + progress.segmentation * 0.3 + progress.textProcessing * 0.1 + progress.structure * 0.1 + Number.EPSILON) * 100) / 100;
  }
  if (!bot) {
    parentPort?.postMessage({ free: true });
    return parentPort?.postMessage({ error: '[Training] Bot not found' })
  }
  const currentSegments = await (await mongo.openCollection<Segment>(process.env.SEGMENTS_INDEX || 'segment')).find({ botId: bot.id }).toArray();
  // spawn training worker
  try {
    if (!bot.openaiConfig?.tempContent) {
      bot.openaiConfig = {
        temperature: 0.4,
        llmModel: 'gpt-3.5-turbo',
        messageBuffer: 2,
        openaiKey: process.env.OURS_DEFAULT_OPENAI_KEY || '',
        tempContent: update,
      }
    }
    const tokenThreshold = ai.tokenThreshold(bot.openaiConfig.llmModel as OpenAIModel);
    const promptThreshold = Math.floor(0.3 * tokenThreshold);
    const behavioralRulesTokens = ai.getTokens(update.behavioralRules || '');
    if (query.overload !== 'true' && behavioralRulesTokens > promptThreshold) {
      const error = new Error(`Behavioral rules too long. Please keep it under ${promptThreshold} tokens.`);
      error.name = 'BehavioralRulesTooLongError';
      throw error;
    }
    const normalize = (str: string) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const behavioralRulesNormalized = normalize(update.behavioralRules || '');
    bot.hasAttendance = !behavioralRulesNormalized.includes("atendimento humano esta desabilitado");
    const languages = getLanguages((update.behavioralRules || '').match(/\[\*?[a-z]{2}(-[A-Z]{2})?\]/gm)?.map(lang => lang.slice(1, -1)) || [])
    if (languages.length > 0) {
      update.language = {
        allowedLanguages: languages.filter(Boolean) as string[],
        defaultLanguage: languages.find((lang) => lang?.startsWith('*')) || languages[0]!,
      }
    } else if (languages.length === 0 && behavioralRulesNormalized.length > 15) {
      const languageDetector = await ai.getLanguageDetector();
      const languageCode = (await languageDetector(behavioralRulesNormalized))[0].label;
      let languages = getLanguages([languageCode]);
      update.language = {
        allowedLanguages: languages,
        defaultLanguage: languages[0]
      }
    } else {
      update.language = {
        allowedLanguages: [defaultTrainingLanguage],
        defaultLanguage: defaultTrainingLanguage
      }
    }
    update.sourceFiles = update.sourceFiles?.map(url => url.endsWith('file') ? url.slice(0, -5): url);
    update.sourceFiles?.push(...update.sourceUrls.filter(url => url.endsWith(' file')).map(url => url.slice(0, -5)));
    update.sourceUrls?.push(...extractURLs(update.sourceText));
    progressPercentage.structure = 100;
    logger.info(`[Training] Training progress: ${getPercentage(progressPercentage)}% - Information structure processed`);
    // const pagesContents = update.sourceUrls.map(async (url) => {
    //   const pageContent = await parsePage(url);
    //   return pageContent;
    // }); // prevenir scraping de páginas
    const filesContents = update.sourceFiles?.map(async (url) => {
      const ext = await getExtensionBeforeDownload(url);
      progressPercentage.textProcessing += 100 / (update.sourceFiles?.length || 1);
      logger.info(`[Training] Training progress: ${getPercentage(progressPercentage)}% - Processing ${url} as ${ext}`);
      if (!ext) {
        return null
      }
      if (ext === 'pdf') {
        return (await parsePDF(url)).text;
      } else if (['doc', 'docx'].includes(ext)) {
        return (parseDocx(url));
      } else if (['xls', 'xlsx', 'csv'].includes(ext)) {
        return parseSheet(url) as Promise<Record<string, string>[]>;
      } else if (['txt']) {
        return (parseTextFile(url));
      }
    });
    const fullContents = [...(filesContents ?? []), update.sourceText];
    const segmentsArrays = fullContents.map(async (text) => {
      const input = await text;
      progressPercentage.segmentation += 100 / (fullContents.length || 1);
      logger.info(`[Training] Training progress: ${getPercentage(progressPercentage)}% - Segmenting inputs`);
      if (!Array.isArray(input) && typeof input === 'string') {
        return ai.semanticSegmentation(input as string, 0.4);
      } else if (Array.isArray(input)) {
        return input.map((row) => Object.keys(row).map((key) => `${key}: "${row[key]}"`).join(' | '));
      }
      return [];
    });
    const newSegments = await Promise.all(segmentsArrays.map(async (arr) => 
      (await arr).filter((segment) => !currentSegments.find((currentSegment) => currentSegment.segment === segment))
    ));
    const documents = (await Promise.all(newSegments.map(async (arr) => {
      const segments = await arr;
      const chunks = chunk(150, segments);
      const documents: {
        botId: string,
        segment: string,
        cleanedSegment: string,
        embedding: unknown[],
        index: number,
      }[] = [];
      for (const chunk of chunks) {
        const generatedDocs = await Promise.all(chunk.map(async (segment, i) => {
          progressPercentage.embedding += 100 / ((segments.length * fullContents.length) || 1);
          if (process.env.LOG_TRAINING_PROGRESS === 'true' || getPercentage(progressPercentage) === 100) {
            logger.info(`[Training] Training progress: ${getPercentage(progressPercentage)}% - Generating embeddings`);
          }
          const embedding = await vectorizer(ai.removeStopwords(segment).toLowerCase(), { pooling: 'mean', normalize: true });
          const document = {
            botId: bot.id,
            segment,
            cleanedSegment: ai.removeStopwords(segment).toLowerCase(),
            embedding: Array.from(embedding.data),
            index: i,
          }
          return document;
        }));
        documents.push(...generatedDocs);
      };
      return documents;
    }))).flat().filter((document) => ai.segmentText(document.segment, 'words').length > 2);
    const currentSegmentsToKeep = [] as WithId<Segment>[];
    (await Promise.all(segmentsArrays.flat().map(async part => await part))).flat().forEach(async (segment) => {
      const currentDoc = currentSegments.find((currentSegment) => currentSegment.segment === segment);
      if (currentDoc) {
        currentSegmentsToKeep.push(currentDoc);
      }
    });
    let deleteResult: DeleteResult | null = null;
    if (await ((await mongo.openCollection(process.env.SEGMENTS_INDEX || 'segment')).countDocuments({ botId: bot.id })) > 0) {
      deleteResult = await (await mongo.openCollection(process.env.SEGMENTS_INDEX || 'segment')).deleteMany({ botId: bot.id, _id: { $nin: currentSegmentsToKeep.map(seg => seg._id) } });
      logger.info(`Deleted ${deleteResult.deletedCount} segments for bot ${bot.id}`);
    }
    const insertResult = documents.length > 0 ? await (await mongo.openCollection(process.env.SEGMENTS_INDEX || 'segment')).insertMany(documents) : { insertedCount: 0 };
    const { id, ...filteredBotFields } = bot;
    const filtered = filteredBotFields as Prisma.BotUpdateInput;
    const botUpdate = { ...filtered, openaiConfig: { ...filtered.openaiConfig, tempContent: update
    } as any, trainingInfo: {
      status: 'FINISHED',
      errorMessages: [],
      dataJson: JSON.stringify(data.body),
      duration: Date.now() - startTime,
    } } satisfies Prisma.BotUpdateInput;
    const updateResult = await prisma.bot.update({
      where: {
        id: bot.id,
      },
      data: botUpdate,
    }).then(() => logger.info(`[Training] Updated bot ${bot.id} to FINISH in database`))
      .catch(e => logger.error(`[Training] An error has occurred while updating bot ${bot.id} to FINISH in database. Error: ${e}`));
    parentPort?.postMessage({ info: `[Training] Indexed ${insertResult.insertedCount} new segments for bot ${bot.id}` });
    parentPort?.postMessage({ free: true });
    parentPort?.postMessage({
      data: {
        new_segments: insertResult.insertedCount,
        deleted_segments: deleteResult ? deleteResult.deletedCount : 0,
        total_segments: await (await mongo.openCollection(process.env.SEGMENTS_INDEX || 'segment')).countDocuments({ botId: bot.id }),
        bot: updateResult,
      }
    });
  } catch (e) {
    currentJob = undefined;
    prisma.bot.update({
      where: {
        id: bot.id
      },
      data: {
        trainingInfo: {
          dataJson: JSON.stringify(data.body),
          status: 'ERROR',
          errorMessages: [`${e}`],
          duration: Date.now() - startTime,
        }
      }
    }).then(() => logger.info(`[Training] Updated bot ${bot.id} to ERROR in database`))
      .catch(e => logger.error(`[Training] An error has occurred while updating bot ${bot.id} to ERROR in database. Error: ${e}`));
    logger.error(e);
    parentPort?.postMessage({ error: e });
  }
  if (jobQueue.length > 0) {
    parentPort?.postMessage({ free: false });
    currentJob = jobQueue.pop();
    if (currentJob) {
      train(currentJob);
    }
  } else {
    parentPort?.postMessage({ free: true });
    currentJob = undefined;
  }
}
parentPort?.on('message', (data: WorkerData) => {
  jobQueue.push(data);
  parentPort?.postMessage({ free: false });
  logger.info(`[Training] New training using worker #${data.workerId}`);
  logger.info(`[Training] Training data:`);
  logger.info(data);
  if (!currentJob) {
    currentJob = jobQueue.pop();
    if (currentJob) {
      train(data);
    }
  }
});
