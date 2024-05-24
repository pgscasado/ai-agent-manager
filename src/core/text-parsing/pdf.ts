import { deleteFile, download } from '.';
import fs from 'fs';
import child_process from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const parserPath = path.join(__dirname, 'util/parser.js');

export const parsePDF = async (url: string, opts: { isLocal: boolean, deleteTemp: boolean } = { isLocal: false, deleteTemp: true }) => {
  let path = url;
  if (!opts.isLocal) {
    path = await download(url);
  }
  child_process.execSync(`node ${parserPath} ${path}`);
  const dataPath = path.substring(0, path.lastIndexOf('.')) + '.json';
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  const outputText = data.Pages.reduce((acc: string, page: any) => {
    return acc + page.Texts.reduce((acc: string, text: any) => {
      return acc + decodeURIComponent(text.R[0].T);
    }, '');
  }, '') as string;
  deleteFile(path, opts.deleteTemp);
  return {
    text: outputText
  };
}
