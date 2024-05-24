import compromise from 'compromise'
import { getVectorizer } from './transformers';
import { removeStopwords } from './stopwords';

export const segmentText = (
  text: string,
  method: 'sentences' | 'words' | 'paragraphs',
): string[] => {
  if (!text.split) {
    return [];
  }

  switch (method) {
    case 'words':
      return text.split(' ');
    case 'sentences':
      const doc = compromise(text);
      return doc.sentences().out('array');
    default:
      return text.split('\n\n');
  }
};

export const semanticSegmentation = async (
  texts: string,
  threshold: number = 0.5,
  method: 'sentences' | 'words' | 'paragraphs' = 'paragraphs',
) => {
  const segments = segmentText(texts, method);

  // Segmentação por duas quebra de linhas não agrupa por similaridade
  if (method === 'paragraphs') {
    return aggregateSmallSegments(segments);
  }

  const sentences: string[] = [];
  let startIdx = 0;
  let endIdx = 1;
  let segment = [segments[startIdx]];
  while (endIdx < segments.length) {
    const normalizedStart = compromise(segments[startIdx])
      .normalize()
      .out('text');
    const normalizedEnd = compromise(segments[endIdx]).normalize().out('text');
    const sim = await similarity(normalizedStart, normalizedEnd);
    if ((sim.valueOf() as number) > threshold) {
      segment.push(segments[endIdx]);
    } else {
      sentences.push(segment.join(' '));
      startIdx = endIdx;
      segment = [segments[startIdx]];
    }
    endIdx++;
  }
  if (segment.length > 0) {
    sentences.push(segment.join(' '));
  }
  return sentences;
};

export async function similarity(str1: string, str2: string) {
  const vectorizer = await getVectorizer();
  const cleanedStr1 = removeStopwords(str1);
  const cleanedStr2 = removeStopwords(str2);
  if (cleanedStr1.length === 0 || cleanedStr2.length === 0) {
    return 0;
  }
  const [vec1, vec2] = await Promise.all([cleanedStr1, cleanedStr2].map((str) => vectorizer(str, { pooling: 'mean', normalize: true })));
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;
  for (let i = 0; i < vec1.data.length; i++) {
    dotProduct += vec1.data[i] * vec2.data[i];
    norm1 += vec1.data[i] * vec1.data[i];
    norm2 += vec2.data[i] * vec2.data[i];
  }
  norm1 = Math.sqrt(norm1);
  norm2 = Math.sqrt(norm2);
  const similarity = dotProduct / (norm1 * norm2);
  return similarity;
}

const aggregateSmallSegments = (segments: string[]) => {
  return segments.reduce((acc, segment) => {
    if (segment !== '') {
      if (acc.length > 0) {
        const lastSegment = acc[acc.length - 1];
        if (lastSegment.length < 80) {
          acc[acc.length - 1] = `${lastSegment}\n${segment}`;
        } else {
          acc.push(segment);
        }
      } else {
        acc.push(segment);
      }
    }
    return acc;
  }, [] as string[]);
}