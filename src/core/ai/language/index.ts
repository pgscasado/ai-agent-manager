import { createReadStream } from 'fs';
//@ts-ignore
import { JSONParser } from '@streamparser/json';
import type { JSONParser as JSONParserType } from '@streamparser/json/dist/mjs/index';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const streamSearch = (text: string, filepath: string) => new Promise<true|null>((resolve) => {
  const parser: JSONParserType = new JSONParser();
  parser.onValue = ({ value, key, parent, stack }) => {
    if (value && `${value}`.toLowerCase() === text.toLowerCase()) {
      stream.close();
      resolve(true);
    }
  };
  const stream = createReadStream(path.join(__dirname, filepath));
  stream.on('data', (part) => {
    parser.write(part);
  });
  stream.on('end', () => {
    resolve(null);
  })
})