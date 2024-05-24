import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import mime from 'mime-types';
import { logger } from '../logging/logger';
import { fileURLToPath } from 'url';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const download = async (url: string): Promise<string> => {
  const response = await axios.get(url, { responseType: 'stream' });
  const contentType = response.headers['content-type'];
  const extension = mime.extension(contentType as string);
  const destinationDir = path.join(__dirname, 'tmp');
  if (!fs.existsSync(destinationDir)) {
    fs.mkdirSync(destinationDir);
  }
  const destination = path.join(destinationDir, `${randomUUID()}.${extension}`);
  const fileStream = fs.createWriteStream(destination, { flags: 'wx' });
  return new Promise((resolve, reject) => {
    response.data.pipe(fileStream);
    let error: Error | null = null;
    fileStream.on('error', err => {
      error = err;
      fileStream.close();
      reject(err);
    });
    fileStream.on('close', () => {
      if (!error) {
        resolve(destination);
      }
      //no need to call the reject here, as it will have been called in the
      //'error' stream;
    });
  });
}

export const deleteFile = (path: string, dangling: boolean = false) => {
  fs.unlink(path, (err) => {
    if (err) {
      logger.error(`[PDF] Failed to delete file ${path}`);
    }
  });
  if (dangling) {
    const dataPath = path.substring(0, path.lastIndexOf('.')) + '.json';
    fs.unlink(dataPath, (err) => {
      if (err) {
        logger.error(`[PDF] Failed to delete file ${dataPath}`);
      }
    });
  }
}

export const getExtensionBeforeDownload = async (url: string) => {
  const contentType = mime.lookup(url);
  if (contentType) {
    return mime.extension(contentType);
  } else {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const contentType = response.headers.get('content-type');
      if (contentType) {
        return mime.extension(contentType);
      }
      return null;
    } catch {
      return null;
    }
  }
}
