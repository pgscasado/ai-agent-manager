import { Bots } from '@controllers/Bots';

export const getSegmentsWithFileAttachments = (segments: Awaited<ReturnType<typeof Bots.functions.relatedSegments>>) => segments.filter(({segment}) => segment.includes('[attachment]'));

export const getAttachmentFieldFromSegment = ({segment}: Awaited<ReturnType<typeof Bots.functions.relatedSegments>>[number]) => {
  const data = segment.split(/\|(?=([^"]*"[^"]*")*[^"]*$)/g);
  const json = data.map(segmentAsJSON).reduce((acc, current) => Object.assign(acc, current), {});
  const [_, attachment] = Object.entries(json).find(([key, value]) => key.includes('[attachment]')) || [];
  return attachment;
}

export const segmentAsJSON = (entry: string) => {
  try {
    const [key, value] = entry.split(': \"');
    return { [key.trim()]: value.replace(/"(\s?)$/, '') }
  } catch {
    return {};
  }
};

export const DataURIRegex = /data:(?<mime>[\w/\-\.]+);(?<encoding>\w+),(?<data>.*)/;
export const isDataURI = (attachment: string) => attachment.match(DataURIRegex)?.groups as {
  mime: string,
  encoding: string,
  data: string,
} | undefined;

export const attachmentRegex = /(?:ANEXO|ATTACHMENT)\((?<url>[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=-]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*))\)/ig;
export const extractAttachmentFromResponse = (responseText: string) => {
  const urls = Array.from(responseText.matchAll(attachmentRegex)).map(match => match?.[1]);
  return urls;
}