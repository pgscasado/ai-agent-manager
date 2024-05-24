import { ChatOpenAI } from 'langchain/chat_models/openai';
import { AIMessage, BaseMessage, HumanMessage, SystemMessage } from 'langchain/schema';
import { Prisma } from '@prisma/client';
import { JSONPrompt, ParaphraseAndTranslatePrompt, PromptVariables, attendanceMiniPrompt, attendancePrompt, defaultBehavioralRules, generalPrompt, languageMiniPrompt, lineSeparatorMiniPrompt, linkMiniPrompt, timestampMiniPrompt, topicsMiniPrompt, attachmentMiniPrompt, inactivePrompt } from './openai/prompt';
import { Bots, nullsToUndefined } from '@root/controllers/Bots';
import { logger } from '../logging/logger';
import prisma from '@root/prisma';
import { getTokens } from './openai/encoding';
import { OpenAIModel, tokenThreshold, modelNameMapper } from './openai/thresholds';
import { CreateChatCompletionResponse } from 'openai';
import { inspect } from 'util';
import { LanguageLabel, ai } from '.';
import { subMinutes } from 'date-fns';
import codes from './language/codes.json'
import axios, { AxiosError } from 'axios';
import { chooseAttachment, serializeDataURISegment } from './openai/attachment';
import { attachmentRegex, extractAttachmentFromResponse, getAttachmentFieldFromSegment, getSegmentsWithFileAttachments, isDataURI } from './fileAttachment';
import { getExtensionBeforeDownload } from '../text-parsing';
import { snakecase } from '../casing';

export const UNDEFINED_MESSAGE_TAG = '#<undefined>';

export type openaiInstance = typeof openai;
export const openai = async (messages: BaseMessage[], bot: Prisma.BotCreateInput, aiConfigs: Awaited<ReturnType<typeof getConfigs>>['chat'], jsonResponse = false) => {
  const start = Date.now();
  const response = (await axios('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${bot.openaiConfig?.openaiKey}`
    },
    timeout: Number(process.env.OPENAI_TIMEOUT || 30000),
    data: JSON.stringify({
      messages: parseMessages(messages),
      response_format: { type: jsonResponse ? 'json_object' : 'text' },
      model: modelNameMapper(aiConfigs?.modelName as OpenAIModel || 'gpt-3.5-turbo'),
      temperature: aiConfigs?.temperature || 0.4,
      top_p: aiConfigs?.topP || 0.5,
      frequency_penalty: aiConfigs?.frequencyPenalty || 0,
    })
  })).data as {
    choices: {
      index: number,
      finish_reason: string,
      message: {
        content: string,
        role: 'user' | 'system' | 'assistant',
      }
    }[],
    usage: {
      total_tokens: number,
      prompt_tokens: number,
      completion_tokens: number,
    }
  };
  const latency = Date.now() - start;
  prisma.chatGPTCall.create({
    data: {
      latency: latency,
      botId: bot.id!,
      apiKeyHint: `${aiConfigs?.openAIApiKey?.substring(0, 5)}...${aiConfigs?.openAIApiKey?.substring(aiConfigs?.openAIApiKey.length - 5, aiConfigs?.openAIApiKey.length)}`,
      model: aiConfigs?.modelName || 'failed to get model name',
      totalTokens: response.usage.total_tokens,
      promptTokens: response.usage.prompt_tokens,
      responseTokens: response.usage.completion_tokens,
    }
  }).then(() => logger.info(`[AI][OpenAI] GPT Call latency: ${latency}ms, cost: ${response?.usage?.total_tokens || 'unreachable'}`)).catch((err) => logger.error(`[AI][OpenAI] ${err}`));
  return response;
}

export const dynamicAnswer = async (base: string, bot: Prisma.BotCreateInput, aiConfigs: Awaited<ReturnType<typeof getConfigs>>['chat'], languageSample?: string) => {
  let languages = Array.from(bot.openaiConfig?.tempContent?.language?.allowedLanguages as string[] || [])
  if (languageSample) {
    const languageDetector = await ai.getLanguageDetector();
    const language = await languageDetector(languageSample);
    const detectedLanguage = codes[(language)[0].label as LanguageLabel];
    const foundLanguage = languages.find((lang) => lang.toLowerCase().includes(detectedLanguage));
    if (foundLanguage) {
      languages.splice(0, languages.length, foundLanguage);
    }
  }
  try {
    const response = await (await openai([
      new HumanMessage(ParaphraseAndTranslatePrompt(base, languages))
    ], bot, aiConfigs));
    return response.choices[0].message?.content;
  } catch {
    logger.error(`[AI][OpenAI] Failed to get dynamic answer for ${base}`);
    return base;
  }
};

export const getConfigs = async (bot: Prisma.BotCreateInput) => {
  const { tempContent: configs, ...params } = bot.openaiConfig! as Prisma.OpenAIConfigCreateInput;
  return {
    chat: new ChatOpenAI({
      temperature: params.temperature || 0.4,
      topP: 0.5,
      frequencyPenalty: 1.7,
      maxTokens: bot.tokenLimit && bot.tokenLimit !== 0 ? bot.tokenLimit : 750,
      openAIApiKey: params.openaiKey,
      modelName: params.llmModel,
    }),
    prompt: await generalPrompt.partial({
      botName: configs.botName,
      behavioralRules: configs.behavioralRules || defaultBehavioralRules,
      languageMiniPrompt: languageMiniPrompt(configs.language),
      linkMiniPrompt: linkMiniPrompt((configs.sourceUrls as string[] || []).slice(0, 5)),
      topicsMiniPrompt: topicsMiniPrompt(configs.topics as string[]),
      attendanceMiniPrompt: attendanceMiniPrompt(bot),
      timestampMiniPrompt: timestampMiniPrompt(true),
      lineSeparatorMiniPrompt,
      attachmentMiniPrompt
    } satisfies Partial<PromptVariables>)
  }
}

export const collectRelatedSegmentsUntilThreshold = async (question: string, bot: Prisma.BotCreateInput, threshold: number = 3500, minSegments: number = 5) => {
  async function fillUntilThreshold(segments: Awaited<ReturnType<typeof Bots.functions.relatedSegments>>, threshold: number) {
    const languages = Array.from(bot.openaiConfig?.tempContent?.language?.allowedLanguages as string[] || []);
    if (languages.length > 0) {
      const languageDetector = await ai.getLanguageDetector();
      const detectedLanguage = codes[(await languageDetector(ai.removeStopwords(question)))[0].label as LanguageLabel];
      const foundLanguage = languages.find((lang) => lang.toLowerCase().startsWith(detectedLanguage));
      if (foundLanguage) {
        languages.splice(0, languages.length, foundLanguage);
      }
    }
    const messages = [
      new SystemMessage(await prompt.format({
        textContent: segments.map(serializeDataURISegment).map(({ segment }) => segment).join('\n---\n') || 'Sem informações suficientes.'
      } satisfies Partial<PromptVariables>)),
      new SystemMessage(JSONPrompt(languages, bot.hasAttendance || true, bot.directAttendance || true)),
      new HumanMessage(question)
    ];
    const tokens = messages.map(msg => msg.content.concat('\n---\n')).reduce((acc, curr) => getTokens(curr) + acc, 0);
    if (tokens > threshold) {
      const lastSegment = segments.slice(-1)[0];
      if (!lastSegment) return [];
      return fillUntilThreshold(segments.slice(0, -1), threshold);
    }
    logger.info(`[AI][OpenAI] tokens used: ${tokens}, threshold: ${threshold}`);
    return segments;
  }
  const { prompt } = await getConfigs(bot);
  const segmentsCount = 100; // await (await mongo.openCollection('segment')).countDocuments();
  const allSegments = await Bots.functions.relatedSegments(bot.id!, question, segmentsCount, bot.textSearch || false);
  const segments = await fillUntilThreshold(allSegments, threshold);
  if (segments.length < minSegments) {
    const remainingSegmentSpaces = allSegments.slice(segments.length, minSegments);
    segments.push(...remainingSegmentSpaces);
  }
  const textContent = segments.map(serializeDataURISegment).map(({ segment }) => `${segment}`).join('\n---\n') || 'Sem informações suficientes.';
  const finalPrompt = await prompt.format({
    textContent
  } satisfies Partial<PromptVariables>);
  return {
    segments,
    prompt: finalPrompt,
  };
}

type getAnswerReturnDefault = { 
  result: {
    type: 'default' | 'attachment',
    response: string,
    start_attendance: string,
    asked_for_attendance: string,
    start_integration?: string,
    metadata?: Partial<{
      missing_info: `${boolean}`,
      yes_or_no: `${boolean}`,
      is_greeting: `${boolean}`,
      is_bot_disabled: `${boolean}`,
      is_end_of_conversation: `${boolean}`
    }>
  },
  usage: {
    total_tokens: number,
    prompt_tokens: number,
    completion_tokens: number,
  },
  error?: boolean
}

type getAnswerReturnWithAttachments = getAnswerReturnDefault & {
  result: getAnswerReturnDefault['result'] & {
    type: 'attachment',
    attachments: {
      url: string,
      extension: string,
    }[]
  }
}

type getAnswerReturn = getAnswerReturnDefault | getAnswerReturnWithAttachments;

export function isAttachmentAnswer(answer: getAnswerReturn): answer is getAnswerReturnWithAttachments {
  return answer?.result?.type === 'attachment';
}

type MainPromptOpenAIResult = {
  response: string;
  offer_human_attendance: string;
  start_attendance: string;
  missing_info: `${boolean}`;
  yes_or_no_question: `${boolean}`;
  response_language: string;
  is_greeting_response: `${boolean}`;
}

export const getAnswer = async (question: string, bot: Prisma.BotCreateInput, userId?: string): Promise<getAnswerReturn> => {
  const baseOutputJson: getAnswerReturn = {
    result: {
      type: 'default',
      response: 'Estamos com problemas técnicos, estou te direcionando ao atendimento humano.',
      start_attendance: 'true',
      asked_for_attendance: 'false',
      metadata: {}
    },
    usage: {
      total_tokens: 0,
      prompt_tokens: 0,
      completion_tokens: 0,
    }
  };
  const { chat } = await getConfigs(bot);
  const userHistory: { message: string, response: string, timestamp: Date }[] = [];
  const messageHistorySize = bot.openaiConfig?.messageBuffer || 2;
  let userLanguageSample: string = "";
  if (userId) {
    const timestampLowerLimit = (typeof bot.userHistoryTime === 'undefined' || bot.userHistoryTime === 0) ? new Date(0) : subMinutes(new Date(), bot.userHistoryTime)
    userHistory.push(...(await prisma.message.findMany({
      orderBy: {
        timestamp: 'desc'
      },
      take: messageHistorySize * 4,
      where: {
        botId: bot.id!,
        userId,
        response: {
          not: {
            contains: '"missing_info":"true"'
          }
        },
        timestamp: {
          gte: timestampLowerLimit
        }
      },
      select: {
        message: true,
        response: true,
        timestamp: true,
      }
    })).filter(({ response }, idx, history) => {
      try {
        const sameAnswer = JSON.parse(response).response === JSON.parse(history[idx-1].response).response;
        return idx === 0 || !sameAnswer
      } catch (e) {
        return true; 
      }
    }).map(msg => {
      msg.response = msg.response.replace('asked_for_attendance', 'offer_human_attendance');
      return msg;
    }));
    userHistory.reverse().forEach(({message, response}) => {
      if (message !== UNDEFINED_MESSAGE_TAG) {
        userLanguageSample += ` ${message}.`;
      }
      if (response !== UNDEFINED_MESSAGE_TAG) {
        const parsedMsg = JSON.parse(response).response;
        userLanguageSample += ` ${parsedMsg}`;
      }
    })
    userLanguageSample += ` ${question}`;
    userLanguageSample = userLanguageSample.trim();
  }
  if (userHistory.length === 0 && bot.startMessage) {
    baseOutputJson.result.response = bot.startMessage;
    baseOutputJson.result.start_attendance = 'false';
    return baseOutputJson;
  }

  const normalizedHistory = userHistory.map(({ message, response }) => {
    const arrayOutput: typeof messages = [];
    if (message !== UNDEFINED_MESSAGE_TAG) {
      arrayOutput.push(new HumanMessage(message))
    }
    if (response !== UNDEFINED_MESSAGE_TAG) {
      arrayOutput.push(new AIMessage(response))
    }
    return arrayOutput
  }).flat().slice(messageHistorySize * -2);
  const messagesTokens = parseMessages(normalizedHistory).map((interaction) => getTokens(JSON.stringify(interaction))).reduce((acc, curr) => acc + curr, 0);
  const threshold = tokenThreshold(chat.modelName as OpenAIModel) - messagesTokens;
  const { prompt, segments } = await collectRelatedSegmentsUntilThreshold(question, bot, threshold);
  const languages = Array.from(Array.from(bot.openaiConfig?.tempContent?.language?.allowedLanguages as string[] || []));
  if (languages.length > 0) {
    let detectedLanguage: string;
    if (bot.gptLanguageDetector) {
      const languageDetector = await ai.getLanguageDetector(undefined, true);
      detectedLanguage = codes[(await languageDetector(bot, userLanguageSample))[0].label as LanguageLabel];
    } else {
      const languageDetector = await ai.getLanguageDetector();
      detectedLanguage = codes[(await languageDetector(userLanguageSample))[0].label as LanguageLabel];
    }
    const foundLanguage = languages.find((lang) => lang.toLowerCase().includes(detectedLanguage));
    if (foundLanguage) {
      languages.splice(0, languages.length, foundLanguage);
    }
  }
  const messages = [
    new SystemMessage(prompt),
    new SystemMessage(JSONPrompt(languages, bot.hasAttendance || true, bot.directAttendance || true)),
    new HumanMessage(question)
  ];
  if (userHistory.length > 0) {
    messages.splice(1, 0, ...normalizedHistory);
    const lastMessage = userHistory[userHistory.length - 1];
    const lastResponse = JSON.parse(lastMessage.response) as getAnswerReturn['result'];
    if (lastResponse?.response?.endsWith('Podemos ajudar ainda de alguma forma?')) {
      const sentiment = await ai.getSentimentAnalyzer();
      const result = await sentiment(question, { topk: 1 });
      const decision = ai.parseAsDecision(result[0].label)
      const prompt = await inactivePrompt(question);
      const inactiveRefusalMessages = [new HumanMessage(prompt), new AIMessage('Answer: ')];
      const response = await (await openai(inactiveRefusalMessages, bot, chat)) as CreateChatCompletionResponse;
      const negative: string | undefined = response?.choices?.[0].message?.content;
      const coercedNegative: boolean = negative?.toLowerCase() === 'true';
      if (coercedNegative) {
        return {
          result: {
            type: 'default',
            response: await dynamicAnswer(process.env.POST_INACTIVITY_MESSAGE || 'Certo, vou finalizar a nossa conversa, mas se precisar de mais alguma ajuda, é só chamar novamente! Agradeço pelo contato!', bot, chat, userLanguageSample),
            start_attendance: 'false',
            asked_for_attendance: 'false',
            metadata: {
              is_end_of_conversation: 'true'
            }
          },
          usage: response.usage!,
        };
      } else if (question.toLowerCase().trim() === 'sim') {
        return {
          result: {
            type: 'default',
            response: 'Certo! Como ainda posso te ajudar?',
            start_attendance: 'false',
            asked_for_attendance: 'false',
          },
          usage: response.usage!,
        }
      } else {
        userHistory.pop();
        normalizedHistory.pop();
        messages.splice(1, normalizedHistory.length + 1, ...normalizedHistory);
      }
    }
    if (!bot.directAttendance && lastMessage && JSON.parse(lastMessage.response).offer_human_attendance === 'true') {
      const botMessage = JSON.parse(lastMessage.response).response;
      const lastPart = botMessage.split('.')?.slice(-1)?.[0];
      const prompt = await attendancePrompt.format({ text: question, lastMessage: lastPart || botMessage });
      try {
        const sentiment = await ai.getSentimentAnalyzer();
        const result = await sentiment(question, { topk: 1 });
        const decision = ai.parseAsDecision(result[0].label) 
        const response = await (await openai([new HumanMessage(prompt)], bot, chat, true)) as CreateChatCompletionResponse;
        const answer: string = JSON.parse(response.choices[0].message?.content || '{}').response || 'undefined';
        if (answer.toLowerCase().includes('affi') || decision) {
          return {
            result: {
              type: 'default',
              response: await dynamicAnswer('Um consultor irá entrar em contato com você em breve. Obrigado por entrar em contato conosco.', bot, chat, userLanguageSample),
              start_attendance: 'true',
              asked_for_attendance: 'false',
              metadata: {
                is_end_of_conversation: 'true'
              }
            },
            usage: response.usage!,
          }
        } else if (answer.toLowerCase().includes('nega')) {
          return {
            result: {
              type: 'default',
              response: await dynamicAnswer('Tudo bem, iremos continuar com o atendimento virtual.', bot, chat, userLanguageSample),
              start_attendance: 'false',
              asked_for_attendance: 'false',
            },
            usage: response.usage!,
          }
        }
      } catch (e) {
        logger.error(`[AI][OpenAI] ${e} ${(e as AxiosError).message}`);
        if ((e as Error).stack) {
          logger.error((e as Error).stack);
        }
        return {
          result: {
            type: 'default',
            response: await dynamicAnswer('Estamos com problemas técnicos, estou te direcionando ao atendimento humano.', bot, chat, userLanguageSample),
            start_attendance: 'true',
            asked_for_attendance: 'false',
          },
          usage: {
            completion_tokens: 0,
            prompt_tokens: 0,
            total_tokens: 0,
          },
          error: true
        }
      }
    }
  }
  logger.info(`[AI][OpenAI] Instructions: ${inspect(parseMessages(messages))}`)
  try {
    const response = await (await openai(messages, bot, chat, true));
    logger.info('[AI][OpenAI] Response:')
    logger.info(response.choices[0].message?.content);
    let parsedJson: MainPromptOpenAIResult;
    try {
      parsedJson = JSON.parse(response.choices[0].message?.content.replace(/\\n/g, '\\n'));
    } catch {
      parsedJson =  JSON.parse(sintaticallyFixJSON(response.choices[0].message?.content));
    }
    const attachments = extractAttachmentFromResponse(parsedJson.response);
    const fileSegments = getSegmentsWithFileAttachments(segments);
    let selectedAttachment = attachments[0] || "";
    if (attachments.length === 0 && fileSegments?.length > 0) {
      const file = await (await chooseAttachment(fileSegments, `User: ${question} -> Bot: ${parsedJson.response}`, openai, bot, chat));
      const chosenSegment = /^\d+$/.test(file.choices[0].message.content) ? +(file.choices[0].message.content) - 1 : -1;
      if (chosenSegment >= 0) {
        const url = getAttachmentFieldFromSegment(fileSegments[chosenSegment]);
        if (url) {
        const dataURIData = isDataURI(url);
        logger.info(`[OpenAI][File Attachment] O anexo selecionado foi ${ dataURIData ? `<Data URI: ${dataURIData.mime}>` : url}`);
          selectedAttachment = url;
        }
      }
    }
    const output = await mountOutputJSON(baseOutputJson, parsedJson, attachments, bot, chat, userLanguageSample);
    return output;
  } catch (e) {
    logger.error(`[AI][OpenAI] ${e}`);
  }
  baseOutputJson.result.response = await dynamicAnswer(baseOutputJson.result.response, bot, chat, userLanguageSample);
  return baseOutputJson;
}

const mountOutputJSON = async (json: getAnswerReturn, data: MainPromptOpenAIResult, attachments: string[], bot: Prisma.BotCreateInput, chat: Awaited<ReturnType<typeof getConfigs>>['chat'], userLanguageSample?: string) => {
  if (!json.result.metadata) {
    json.result.metadata = {};
  }
  if (attachments) {
    json.result.type = 'attachment';
  }
  if (isAttachmentAnswer(json)) {
    json.result.attachments = await Promise.all(attachments.map(async att => ({
      url: att,
      extension: (await getExtensionBeforeDownload(att)) || ''
    })));
  }
  json.result.metadata.yes_or_no = data.yes_or_no_question;
  json.result.metadata.missing_info = `false`;
  json.result.start_attendance = 'false';
  json.result.metadata.is_greeting = data.is_greeting_response;
  json.result.response = data.response;
  if (bot.directAttendance && (`${data.offer_human_attendance}` === 'true' || data.start_attendance === 'true')) {
    json.result.start_attendance = 'true';
    json.result.asked_for_attendance = 'false';
    if (!json.result.response.includes(' Você está na fila e será atendido(a) em instantes.')) {
      json.result.response += ' Você está na fila e será atendido(a) em instantes.'
    }
  } else if (!bot.directAttendance) {
    json.result.start_attendance = `${data.start_attendance === 'true' && bot.hasAttendance}`;
    json.result.asked_for_attendance = `${
      data.offer_human_attendance === 'true'
      && bot.hasAttendance
      && (bot.attendanceOnGreeting || data.is_greeting_response === 'false')
    }`;
    if (json.result.asked_for_attendance === 'true' && !json.result.response.endsWith('?')) {
      json.result.response += ` ${await dynamicAnswer('Deseja falar com um atendente?', bot, chat, userLanguageSample)}`;
    } else if (json.result.asked_for_attendance === 'true' && ['direcionando', 'aguarde', 'atendimento', 'humano'].some(word => json.result.response.toLowerCase().includes(word)) && !json.result.response.endsWith('?')) {
      json.result.response = `${await dynamicAnswer('Deseja falar com um atendente?', bot, chat, userLanguageSample)}`;
    }
  }
  json.usage = json.usage;
  return json;
}

export const sintaticallyFixJSON = (jsonString: string): string => {
  let fixedJSON = jsonString.trim()
  fixedJSON = fixedJSON.startsWith('{"') ? fixedJSON : `{"${fixedJSON}`;
  if (fixedJSON.endsWith('\\')) {
    fixedJSON.slice(0, -1);
  }
  if (/,( )?\"([a-zA-Z]+(_[a-zA-Z]+)+)_?"?$/.test(fixedJSON)) {
    if (!fixedJSON.endsWith('"')) {
      fixedJSON += '"';
    }
    fixedJSON += ':'
  }
  if (fixedJSON.endsWith(':')) {
    fixedJSON += 'null';
  }
  if (!fixedJSON.endsWith('"}')) {
    if (!fixedJSON.endsWith('null') && !fixedJSON.endsWith('"')) {
      fixedJSON += '"';
    }
    if (!fixedJSON.endsWith("}")) {
      fixedJSON += '}';
    }
  }
  const output: MainPromptOpenAIResult = {
    is_greeting_response: 'false',
    missing_info: 'false',
    offer_human_attendance: 'false',
    response: '',
    response_language: 'pt',
    start_attendance: 'false',
    yes_or_no_question: 'false',
    ...nullsToUndefined(JSON.parse(fixedJSON.replace(/\\/g, '\\')))
  }
  return JSON.stringify(output);
}

type OpenAIMessage = {
  role: 'user' | 'system' | 'assistant';
  content: string;
  name?: string;
}

export const parseMessages = (messages: BaseMessage[]) => messages.map((m) => {
  const msgType = m._getType();
  if (msgType === 'human') {
    return {
      role: 'user',
      content: m.content,
    } satisfies OpenAIMessage;
  } else if (msgType === 'system') {
    return {
      role: 'system',
      content: m.content,
    } satisfies OpenAIMessage;
  } else {
    return {
      role: 'assistant',
      content: m.content,
    } satisfies OpenAIMessage;
  }
});

export const getPrompt = async (question: string, bot: Prisma.BotCreateInput, userId?: string) => {
  const userHistory: { message: string, response: string }[] = [];
  if (userId) {
    userHistory.push(...await prisma.message.findMany({
      orderBy: {
        timestamp: 'desc'
      },
      take: bot.openaiConfig?.messageBuffer || 2,
      where: {
        botId: bot.id!,
        userId,
      },
      select: {
        message: true,
        response: true,
      }
    }));
  }
  const messagesTokens = userHistory.map((interaction) => getTokens(JSON.stringify(interaction))).reduce((acc, curr) => acc + curr, 0);
  const { chat } = await getConfigs(bot);
  const threshold = tokenThreshold(chat.modelName as OpenAIModel) - messagesTokens;
  const { prompt } = await collectRelatedSegmentsUntilThreshold(question, bot, threshold);
  const languages = Array.from(bot.openaiConfig?.tempContent?.language?.allowedLanguages as string[] || []);
  if (languages.length > 0) {
    const languageDetector = await ai.getLanguageDetector();
    const detectedLanguage = codes[(await languageDetector(ai.removeStopwords(question)))[0].label as LanguageLabel];
    const foundLanguage = languages.find((lang) => lang.toLowerCase().startsWith(detectedLanguage));
    if (foundLanguage) {
      languages.splice(0, languages.length, foundLanguage);
    }
  }
  const messages = [
    new SystemMessage(prompt),
    new SystemMessage(JSONPrompt(languages, bot.hasAttendance || true, bot.directAttendance || true)),
    new HumanMessage(question)
  ];
  if (userHistory.length > 0) {
    messages.splice(1, 0, ...userHistory.reverse().map(({ message, response }) => [new HumanMessage(message), new AIMessage(response)]).flat());
  }
  return parseMessages(messages);
}