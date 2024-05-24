import { deleteFile, download } from '.';
import fs from 'fs';
import { logger } from '../logging/logger';

export const parseTextFile = async (url: string) => {
  const path = await download(url);
  return new Promise<string>((resolve) => fs.readFile(path, (err, textBuffer) => {
    deleteFile(path);
    if (err) {
      logger.error(err);
      resolve('');
    }
    const text = textBuffer.toString();
    resolve(text);
  }));
}