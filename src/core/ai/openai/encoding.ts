import { Tiktoken } from '@dqbd/tiktoken/lite';
import cl100kBase from '@dqbd/tiktoken/encoders/cl100k_base.json';

const chatGPTEncoder = new Tiktoken(
  cl100kBase.bpe_ranks,
  cl100kBase.special_tokens,
  cl100kBase.pat_str,
)

export const getTokens = (text: string) => {
  const tokens = chatGPTEncoder.encode(text);
  return tokens.length;
}