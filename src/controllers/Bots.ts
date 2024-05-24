import { OpenAIModel, ai } from '@core/ai';
import { logger } from '@core/logging/logger';
import { mongo } from '@root/database';
import prisma, { Prisma } from '@root/prisma';
import { RequestHandler } from '@root/types/express';
import { objectIdSchema } from '@root/types/zod';
import { inspect } from 'util';
import { WorkerError, triggerKnownWorker } from '../core/ai/workers';
import { ObjectId } from 'bson';
import { size } from 'mathjs';

export * from './Bots/FieldUpdates';

type MockBotMessageResult = Awaited<ReturnType<typeof ai.getAnswer>>;

export const functions = {
  async findBot(id: string) {
    try {
      await objectIdSchema.parseAsync(id)
      return prisma.bot.findUnique({
        where: { id }
      });
    } catch {
      return prisma.bot.findUnique({
        where: { identifier: id }
      });
    }
  },
  async relatedSegments(botId: string, text: string, k: number = 100, textSearch: boolean = false): Promise<({
    _id: string;
    botId: string;
    segment: string;
    index: number;
  })[]> {
    const vectorizer = await ai.getVectorizer();
    const embedding = Array.from((await vectorizer(ai.removeStopwords(text).toLowerCase(), { pooling: 'mean', normalize: true })).data);
    const filter: Record<string, any> = {
      compound: {
        filter: {
          queryString: {
            query: botId, 
            defaultPath: 'botId'
          }
        }
      }
    };
    const topKSegments = await (await mongo.openCollection(process.env.SEGMENTS_INDEX || 'segment')).aggregate([
      {
        $search: {
          index: 'index',
          knnBeta: {
            vector: embedding,
            path: 'embedding',
            k,
            filter
          },
        }
      },
      {
        $project: {
          embedding: 0,
        }
      }
    ]).toArray() as Awaited<ReturnType<typeof functions.relatedSegments>>;
    return topKSegments;
  },
  mockBotMessage(text: string, metadata?: MockBotMessageResult['result']['metadata']): MockBotMessageResult {
    return {
      result: {
        type: 'default',
        asked_for_attendance: 'false',
        response: text,
        start_attendance: 'false',
        metadata,
      },
      usage: {
        completion_tokens: 0,
        prompt_tokens: 0,
        total_tokens: 0
      }
    };
  }
}

export const createBot: RequestHandler<Prisma.BotCreateInput> = async (req, res) => {
  const { id, timestamp, ...filteredBotFields } = req.body;
  try {
    const result = await prisma.bot.create({
      data: filteredBotFields,
    });
    
    await triggerKnownWorker('trainBot', { body: req.body.openaiConfig, params: { id: result.id }, query: {...req.query, overload: process.env.ALWAYS_OVERLOAD_TRAINING || req.query.overload } });
    prisma.bot.update({
      where: {
        id: result.id
      },
      data: {
        trainingInfo: {
          dataJson: JSON.stringify(req.body),
          status: 'ON_TRAINING',
          errorMessages: [],
          duration: 0,
        }
      }
    }).then(() => { logger.info(`Updated bot ${result.id} to TRAINING in database`); res.json({ ...result, _id: result.id, training_status: 'ON_TRAINING'}) })
    .catch(e => {logger.error(`An error has occurred while updating bot ${result.id} to TRAINING in database. Error: ${e}`); res.json({ ...result, _id: result.id, training_status: 'FAILED' })});
  } catch (e) {
    logger.error(e);
    res.status(500).json(e);
  }
}

export const getBots: RequestHandler<never, never, {
  cursor?: string,
  size?: number
}> = async (req, res) => {
  try {
    const { cursor, size } = { size: 5, ...req.query };
    const objCursor = !cursor ? undefined : ObjectId.isValid(cursor) ? { id: cursor } : { identifier: cursor }
    const [count, bots] = await prisma.$transaction([
      prisma.bot.count(),
      prisma.bot.findMany({
        cursor: objCursor,
        skip: objCursor ? 1 : 0,
        take: size,
        select: {
          id: true,
          identifier: true,
          trainingInfo: {
            select: {
              status: true
            }
          }
        },
      }),
    ])
    const lastBot = bots.slice(-1)?.[0];
    const nextCursor = lastBot.id;
    return res.json({
      total_documents: count, 
      total_pages: Math.ceil(count/size),
      next_cursor: nextCursor,
      bots
    });
  } catch (e) {
    logger.error(e);
    res.status(500).json(e);
  }
}

export const getBot: RequestHandler<never, { id: string }> = async (req, res) => {
  const { id } = req.params;
  try {
    const bot = await functions.findBot(id);
    if (!bot) {
      return res.status(404).json({ message: 'Bot not found' });
    }
    return res.json(bot);
  } catch (e) {
    logger.error(e);
    res.status(500).json(e);
  }
}

export const updateBot: RequestHandler<Prisma.BotUpdateInput, { id: string }> = async (req, res) => {
  const { id } = req.params;
  const bot = await functions.findBot(id);
  if (!bot) {
    return res.status(404).json({ message: 'Bot not found' });
  }
  const { timestamp, ...filteredBotFields } = req.body;
  try {
    const result = await prisma.bot.update({
      where: {
        id: bot.id,
      },
      data: filteredBotFields,
    });
    res.json(result);
  } catch (e) {
    logger.error(e);
    res.status(500).json(e);
  }
}

export const deleteBot: RequestHandler<never, { id: string }> = async (req, res) => {
  const { id } = req.params;
  const bot = await functions.findBot(id);
  if (!bot) {
    return res.status(404).json({ message: 'Bot not found' });
  }
  try {
    const result = await prisma.bot.delete({
      where: {
        id: bot.id,
      },
    });
    res.json(result);
  } catch (e) {
    logger.error(e);
    res.status(500).json(e);
  }
}
export type Segment = {
  botId: string;
  segment: string;
  cleanedSegment: string;
  embedding: number[];
  index: number;
};
export type PromptUpdate = NonNullable<Prisma.BotGetPayload<{
  include: {
    openaiConfig: true
  }
}>['openaiConfig']>['tempContent'];
export const updatePrompt: RequestHandler<PromptUpdate, { id: string }> = async (req, res) => {
  try {
    const { id } = req.params;
    const bot = await functions.findBot(id);
    if (!bot) {
      return res.status(404).json({ message: 'Bot not found' });
    }
    await triggerKnownWorker('trainBot', { body: req.body, params: req.params, query: {...req.query, overload: process.env.ALWAYS_OVERLOAD_TRAINING || req.query.overload } });
    prisma.bot.update({
      where: {
        id: bot.id
      },
      data: {
        trainingInfo: {
          dataJson: JSON.stringify(req.body),
          status: 'ON_TRAINING',
          errorMessages: [],
          duration: 0,
        }
      }
    }).then(() => logger.info(`Updated bot ${bot.id} to TRAINING in database`))
      .catch(e => logger.error(`An error has occurred while updating bot ${bot.id} to TRAINING in database. Error: ${e}`));
    res.json({ message: 'Training started' });
  } catch (error) {
    const knownError = error as WorkerError;
    if (knownError.message) {
        return res.status(404).json({ message: knownError.message });
    }
    logger.error(error);
    res.status(500).json(error);
  }
}

export const getTrainingBots: RequestHandler<{ ids: string[] }, never> = async (req, res) => {
  const objectIds = req.body.ids.filter(ObjectId.isValid);
  const uuids = req.body.ids.filter(id => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id));
  const bots = await prisma.bot.findMany({
    where: {
      OR: [
        {
          id: {
            in: objectIds
          }
        },
        {
          identifier: {
            in: uuids
          }
        }
      ]
    },
    select: {
      id: true,
      trainingInfo: true,
    }
  });
  res.json(bots.map(bot => ({
    ...bot,
    trainingInfo: bot.trainingInfo || {
      dataJson: {},
      duration: 0,
      errorMessages: [],
      status: 'FINISH',
      timestamp: new Date().toISOString()
    }
  })).map(bot => ({
    id: bot.id,
    status: bot.trainingInfo?.status,
    messageError: bot.trainingInfo?.errorMessages.join('\n')
  })))
}

export const topK: RequestHandler<{ text: string }, { id: string }> = async (req, res) => {
  const { id } = req.params;
  const bot = await functions.findBot(id);
  if (!bot) {
    return res.status(404).json({ message: 'Bot not found' });
  }
  const { text } = req.body;
  try {
    const topKSegments = await functions.relatedSegments(bot.id, text, 5, bot.textSearch || false);	
    res.json({
      text,
      topK: topKSegments
    });
  } catch (e) {
    logger.error(e);
    res.status(500).json(e);
  }
}

export const getAnswer: RequestHandler<{ text: string, userId: string }, { id: string }> = async (req, res) => {
  const bot = await functions.findBot(req.params.id);
  if (!bot) {
    return res.status(404).json({ message: 'Bot not found' });
  }
  if (bot.disabled) {
    const disabledBotMessage = functions.mockBotMessage('Você está sendo direcionado para o atendimento, aguarde um momento.');
    logger.info(`[AI][DISABLED] Bot is disabled`);
    res.json({ disabledBotMessage });
    return disabledBotMessage;
  }
  const { text } = req.body;
  try {
    const answer = await ai.getAnswer(text.trim(), bot, req.body.userId);
    logger.info(`[AI][OpenAI] Answer: ${inspect(answer)})}`)
    res.json({
      answer
    });
    return answer;
  } catch (e) {
    logger.error(e);
    res.status(500).json(e);
  }
}

export const generatePrompt: RequestHandler<{ text: string, userId?: string }, { id: string }> = async (req, res) => {
  const bot = await functions.findBot(req.params.id);
  if (!bot) {
    return res.status(404).json({ message: 'Bot not found' });
  }
  const { text, userId } = req.body;
  try {
    const prompt = await ai.getPrompt(text, bot, userId);
    res.json({
      prompt
    });
  } catch (e) {
    logger.error(e);
    res.status(500).json(e);
  }
}

export const getPromptTokenLimit: RequestHandler<{}, { id: string }> = async (req, res) => {
  const { id } = req.params;
  const bot = await functions.findBot(id);
  const configs = bot?.openaiConfig;
  if (!bot) {
    return res.status(404).json({ message: 'Bot not found' });
  } else if (!configs?.openaiKey || !configs?.tempContent) {
    return res.status(400).json({ message: 'Bot not configured' });
  }
  const threshold = (ai.tokenThreshold(configs.llmModel as OpenAIModel));
  const promptThreshold = 0.3 * threshold;
  try {
    res.json({ prompt_quota: Math.floor(promptThreshold) });
  } catch (e) {
    logger.error(e);
    res.status(500).json(e);
  }
}

export const paraphrase: RequestHandler<{ text: string }, { id: string }> = async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  const bot = await functions.findBot(id);
  if (!bot) {
    return res.status(404).json({ message: 'Bot not found' });
  }
  try {
    const configs = await ai.getConfigs(bot);
    const result = await ai.dynamicAnswer(text, bot, configs.chat);
    res.json({ paraphrase: result });
  } catch (e) {
    logger.error(e);
    res.status(500).json(e);
  }
}

export * as Bots from './Bots';