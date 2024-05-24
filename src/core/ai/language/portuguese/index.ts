import { streamSearch } from '..';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dirname = path.basename(__dirname);

export const detectPortuguese = async (text: string): Promise<[{label: 'pt', score: 1}]|null> => {
  const files = [
    'greetings_pt.json',
  ];
  for (const file of files) {
    const res = await streamSearch(text, path.join(dirname, file));
    if (res) {
      return [{
        label: 'pt',
        score: 1
      }];
    }
  }
  return null;
}