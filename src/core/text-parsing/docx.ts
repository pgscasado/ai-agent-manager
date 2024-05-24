import mammoth from 'mammoth';
import { deleteFile, download } from '.';

export const parseDocx = async (url: string) => {
  const path = await download(url);
  const result = await mammoth.extractRawText({ path });
  deleteFile(path, true);
  return result.value;
}