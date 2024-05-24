import { fileURLToPath } from 'url';
// @ts-ignore
global.self = global;
// const { env } = require('@xenova/transformers');
import { Pipeline, pipeline, env } from "@xenova/transformers";
env.backends.onnx.wasm.numThreads = Number(process.env.WASM_NUM_THREADS || 1);
import path from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
env.localModelPath = path.join(__dirname, '../../../', 'ai-models');

export type PipelineCallback = (progress: { status: 'done', file: string, name: string } | { status: 'ready', model: string }) => void;

const PipelineProvider =  (task?: string, model?: string) => class PipelineSingleton {
  // defaults to 384 dims vectorizer
  static task = task || 'feature-extraction';
  static model = model || 'intfloat_multilingual-e5-large-quantized';
  static instance: Pipeline | null = null;

  static async getInstance(progress_callback: PipelineCallback | null = null) {
    if (this.instance === null) {
      this.instance = await pipeline(this.task, this.model, { progress_callback: progress_callback || undefined });
    }
    return this.instance;
  }
}

export default PipelineProvider;

let defaultPipeline = PipelineProvider(undefined, undefined);
export const getVectorizer = (progress_callback?: PipelineCallback) => {
  return defaultPipeline.getInstance(progress_callback);
}