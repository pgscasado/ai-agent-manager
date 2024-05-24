import { deleteFile, download } from '.';
import fs from 'fs';
import XLSX from 'xlsx';

export const parseSheet = async (url: string) => {
  const path = await download(url);
  let wb: XLSX.WorkBook;
  if (path.endsWith('.csv')) {
    const buffer = fs.readFileSync(path, { encoding: 'utf-8' });
    wb = XLSX.read(buffer, { type: 'string' });
  } else {
    wb = XLSX.readFile(path);
  }
  // export wb rows to json array
  const rows: unknown[] = [];
  for (const sheetName of wb.SheetNames) {
    rows.push(...XLSX.utils.sheet_to_json(wb.Sheets[sheetName]));
  }
  deleteFile(path);
  return rows;
};
