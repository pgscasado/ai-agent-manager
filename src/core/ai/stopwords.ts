import {
  removeStopwords as clear,
  eng, porBr,
  por, spa,
  fra, ita,
  swe, deu
} from 'stopword'
import { segmentText } from './segmenter';

const supportedLanguages = [
  'portuguese',
  'portuguesePortugal',
  'english',	
  'spanish',
  'french',
  'italian',
  'swedish',
  'deustch'
] as const;

const customStopwordsPTBR = [
  'fica'
];

const languageStopwordMapper: {[key in typeof supportedLanguages[number]]: string[] } = {
  portuguese: porBr.concat(...customStopwordsPTBR),
  portuguesePortugal: por.concat(...customStopwordsPTBR),
  english: eng,
  deustch: deu,
  french: fra,
  italian: ita,
  spanish: spa,
  swedish: swe
}
export const removeStopwords = (text: string, ...languages: (typeof supportedLanguages[number])[]) => {
  if (languages.length === 0) {
    languages = ['portuguese', 'portuguesePortugal'];
  }
  const stopwords: string[] = languages.reduce((acc, language) => {
    if (languageStopwordMapper.hasOwnProperty(language)) {
      return acc.concat(...languageStopwordMapper[language]);
    }
    return acc;
  }, [] as string[]);
  const withoutURLs = text.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '');
  const withoutQuotes = withoutURLs.replace(/['":!?@#^*><.&,\(\)]+/g, '');
  const withoutAccents = withoutQuotes.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return clear(segmentText(withoutAccents, 'words'), stopwords).join(' ');
}
  