const modelThresholds = {
  '16k': 15775,
  '32k': 32158,
  'gpt-3.5-turbo': 3487,
  'gpt-4': 7582,
}

type GPTModel<T extends OpenAIModel> = 
  T extends ('gpt-4' | 'gpt-4-32k') ? 'gpt-4' :
  'gpt-3.5-turbo';

export const modelNameMapper = <T extends OpenAIModel>(model: T): GPTModel<T> => {
  const isGPT4 = (modelName: OpenAIModel): modelName is ('gpt-4' | `gpt-4-32k`) => modelName.startsWith('gpt-4');
  if (isGPT4(model)) {
    return 'gpt-4o' as GPTModel<T>;
  } else {
    return 'gpt-3.5-turbo' as GPTModel<T>;
  }
}

export type OpenAIModel = 'gpt-3.5-turbo' | 'gpt-3.5-turbo-16k' | 'gpt-4' | 'gpt-4-32k' | `gpt-3.5-turbo-${number}` | `gpt-4-${number}` | `gpt-3.5-turbo-${number}-16k` | `gpt-4-${number}-32k`;
export const tokenThreshold = (model: OpenAIModel) => {
  if (model.includes('16k')) return modelThresholds['16k'];
  if (model.includes('32k')) return modelThresholds['32k'];
  if (model.includes('gpt-3.5-turbo')) return modelThresholds['gpt-3.5-turbo'];
  if (model.includes('gpt-4')) return modelThresholds['gpt-4'];
  return 3500;
}