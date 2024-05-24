import PipelineProvider, { PipelineCallback } from './transformers';
import codes from './language/codes.json';
import { detectEnglish } from './language/english';
import { detectPortuguese } from './language/portuguese';
import compromise from 'compromise';
import { Prisma } from '@prisma/client';
import { openai } from './openai';
import { HumanMessage } from 'langchain/schema';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { logger } from '../logging/logger';

const languageDetector = PipelineProvider('text-classification', 'xlm-roberta-base-language-detection-quantized');

export type LanguageLabel = keyof typeof codes;

type LabeledLanguage = {
  label: LanguageLabel,
  score: 1
};
const defaultLanguageDetector = async (text: string): Promise<[LabeledLanguage] | null> => await detectPortuguese(text) || await detectEnglish(text) || null;

const detectLanguageGPT = async (bot: Prisma.BotCreateInput, text: string): Promise<[LabeledLanguage]|null> => {
  if (!bot?.openaiConfig) {
    return null;
  }
  const { openaiConfig: { openaiKey } } = bot;
  if (!openaiKey) {
    return null;
  }
  const messages = [
    new HumanMessage(`In what language is this phrase written: ${text}\n Only answer the ISO 639-1 language code. E.g. "Language code: <code>"`),
  ];
  const result = await openai(messages, bot, new ChatOpenAI({
    openAIApiKey: openaiKey,
    modelName: 'gpt-3.5-turbo',
    temperature: 0.1
  }));
  const response = result?.choices[0]?.message?.content as (string | null);
  if (!response) {
    return null;
  }
  logger.info(`[OpenAI][GPT - Language Detector] Detected language: ${response}`);
  const label = response.split(':').slice(-1)[0]?.trim() as LanguageLabel;
  if (!label || !Object.keys(codes).includes(label)) {
    return null;
  }
  return [{
    label,
    score: 1
  }];
}

type LanguageDetectorResult<T extends boolean | undefined> =
  T extends (false) ?
    (args: string | [string, ...any]) => Promise<any>
  : (bot: Prisma.BotCreateInput, args: string) => Promise<any>
const getLanguageDetector = async <GPT extends boolean | undefined = false>(progressCallback?: PipelineCallback, gpt: GPT = false as GPT): Promise<LanguageDetectorResult<GPT>> => {
  const aiDetector = await languageDetector.getInstance(progressCallback);
  const fn = async (args: string | [string, ...any]) => {
    if (typeof args === 'string') {
      const doc = compromise(args);
      const nouns = doc.match('(#Place|#Organization|#ProperNoun|#Person)').out('array') as string[];
      const withoutNouns = nouns.reduce((acc, noun) => acc.replaceAll(noun, ''), args);
      args = withoutNouns || args;
      return await defaultLanguageDetector(args) || aiDetector(args)
    }
    return aiDetector(...args);
  };
  if (gpt) {
    return (async (bot: Prisma.BotCreateInput, args: string) => await detectLanguageGPT(bot, args) || fn(args)) as LanguageDetectorResult<GPT>
  } 
  return fn as LanguageDetectorResult<GPT>;
}

export {
  languageDetector,
  getLanguageDetector,
};