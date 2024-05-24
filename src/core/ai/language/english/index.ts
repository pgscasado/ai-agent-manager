import { createReadStream } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
// @ts-ignore
import { JSONParser } from '@streamparser/json';
import type { JSONParser as JSONParserType } from '@streamparser/json/dist/mjs/index';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const detectEnglish = async (text: string): Promise<[{label: 'en', score: 1}]|null> => {
  const files = [
    'greetings_en.json',
  ];
  for (const file of files) {
    const res = await new Promise<"en"|null>((resolve) => {
      const parser: JSONParserType = new JSONParser();
      parser.onValue = ({ value, key, parent, stack }) => {
        if (value && `${value}`.toLowerCase() === text.toLowerCase()) {
          stream.close();
          resolve('en');
        }
      };
      const stream = createReadStream(path.join(__dirname, file));
      stream.on('data', (part) => {
        parser.write(part);
      });
      stream.on('end', () => {
        resolve(null);
      })
    });
    if (res) {
      return [{
        label: 'en',
        score: 1
      }];
    }
  }
  return null;
}