import { TextClassificationPipeline } from '@xenova/transformers';
import PipelineProvider, { PipelineCallback } from './transformers';

const sentimentAnalyzer = PipelineProvider('sentiment-analysis', 'Xenova/bert-base-multilingual-uncased-sentiment');

type Options = {
  topk: number
};
export const getSentimentAnalyzer = (progressCallback?: PipelineCallback) => sentimentAnalyzer.getInstance(progressCallback) as Promise<(arg1: string, opts: Options) => Promise<({ label: `${1|2|3|4|5} stars`, score: number })[]>>;

export const parseAsDecision = (label: `${1|2|3|4|5} stars`) => typeof label === 'string' && label.match(/\d/) && +label.replace(/\D+/, '') > 2;