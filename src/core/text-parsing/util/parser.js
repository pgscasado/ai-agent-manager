import fs from 'fs'
import PDFParser from 'pdf2json'
const reader = new PDFParser();

const fileLocation = process.argv[2];
const outDestination = fileLocation.substring(0, fileLocation.lastIndexOf('.')) + '.json';

reader.on('pdfParser_dataReady', (pdfData) => {
  fs.writeFileSync(outDestination, JSON.stringify(pdfData));
});
reader.on('pdfParser_dataError', (errData) => {
  console.error(`[PDF] Failed to parse ${url}\n${errData}`);
});
reader.loadPDF(fileLocation);
