import { Prisma } from '@prisma/client';
import { PromptTemplate } from 'langchain/prompts';

type Mutable<T> = {
  -readonly [K in keyof T]:  Mutable<T[K]>;
}

const promptVariables = [
  'botName',
  'languageMiniPrompt',
  'linkMiniPrompt',
  'textContent',
  'behavioralRules',
  'topicsMiniPrompt',
  'attendanceMiniPrompt',
  'timestampMiniPrompt',
  'lineSeparatorMiniPrompt',
  'attachmentMiniPrompt'
] as const;

const inputVariables: Mutable<typeof promptVariables> = [
  'botName',
  'languageMiniPrompt',
  'linkMiniPrompt',
  'textContent',
  'behavioralRules',
  'topicsMiniPrompt',
  'attendanceMiniPrompt',
  'timestampMiniPrompt',
  'lineSeparatorMiniPrompt',
  'attachmentMiniPrompt'
];

export type PromptVariables = { [key in typeof promptVariables[number]]: string };

export const generalPrompt: PromptTemplate & { partial: (values: { [key in typeof promptVariables[number]]: string }) => Promise<PromptTemplate> } = new PromptTemplate({
  template: '{lineSeparatorMiniPrompt}{attachmentMiniPrompt}{behavioralRules}\n{textContent}\n{attendanceMiniPrompt}',
  inputVariables,
});

export const lineSeparatorMiniPrompt = 'Never omit "\n" from your answer. It should be repeated the same amount you\'re instructed to send. This is required to the conversation to work. If there are 3 consecutive "\n", send "\n\n\n".'

export const attachmentMiniPrompt = 'Never omit "ANEXO(<LINK>)" from your answer. This pattern is required to the conversation to work. You shouldn\'t add ANEXO(<LINK>) without being instructed to do so. If you aren\'t instructed to do so, send the link as plain as you receive it.';

export const defaultBehavioralRules = 'I want you to act as a support agent. Your name is "{botName}". You will provide me with answers from the given info. If the answer is not included, say exactly "Hmm, I am not sure." and stop after that. Refuse to answer any question not about the info. Never break character. Do not translate anything inside double quotes.\n';

export const languageMiniPrompt = (values: Prisma.ChatGPTLanguageConfigCreateInput | undefined | null) => {
  if (!values) {
    return '';
  }
  if (values.allowedLanguages && (values.allowedLanguages as string[])?.length === 1) {
    return `Você sempre deve responder utilizando o dialeto da língua ${(values.allowedLanguages as string[])[0]}.`;
  }
  if (values.allowedLanguages && (values.allowedLanguages as string[])?.length > 1) {
    return `Você sempre deve responder utilizando o dialeto de uma das línguas ${(values.allowedLanguages as string[]).join(', ')}.`;
  }
  if (!values.allowedLanguages || (values.allowedLanguages as string[])?.length) {
    return 'Você sempre deve responder utilizando o dialeto da língua portuguesa.';
  }
  return '';
}

export const linkMiniPrompt = (values: string[]) => {
  if (!values || !values.length) {
    return 'Você não deve incluir nenhum link nas suas respostas';
  }
  return `Você não deve incluir nenhum link nas suas respostas, fora os que estão nessa lista: ${values.join(', ')}.`;
}

export const topicsMiniPrompt = (values: string[]) => {
  if (!values || !values.length) {
    return '';
  }
  return `só responda ${values.map(v => `sobre ${v}`).join(', ')}`;
}

export const attendancePrompt = new PromptTemplate({
  template: `Assistant:"{lastMessage}" -> User:"{text}". Is User's message "affirmative", "negative", or "unrelated/interrogative"? Answer in JSON naming the key as "response". `,
  inputVariables: ['text', 'lastMessage']
});

export const attendanceMiniPrompt = (bot: Prisma.BotCreateInput) => {
  if (!bot.hasAttendance) {
    return '';
  }
  if (bot.directAttendance) {
    return '___\n\
    You can infer when to direct the user to human attendance when you\'re instructed to do so. You will use "offer_human_attendance". When you fill "offer_human_attendance", try to match your answer as you\'re directing the user to attendance.\n\
    You will answer in JSON: the "offer_human_attendance" should be "true" when you direct the user to human attendance, and "false" on all the other cases.\n\
    If you\'re asking something, fill "yes_or_no_question" with "true" if your question can be replied exclusively with "yes" or "no", or "false" if it can\'t.\
    You must fill "is_greeting_response" with "true" if your answer is replying a greeting message, and "false" if it is\'nt.'
  }
  return '___\n\
  Você pode sinalizar transferência do usuário para atendimento humano quando precisar. Você utilizará "offer_human_attendance". Tente dar uma resposta que combine com "offer_human_attendance".\n\
  Você responderá no formato JSON: o campo "offer_human_attendance" deve ser "true" caso identifique que a mensagem é um tema a ser tratado com atendimento humano e "false" caso contrário;\
  Caso você na sua resposta indicou não ter informações sobre o tópico perguntado preencha "missing_info" como "true". Caso contrário, preencha como "false".\
  o campo "response" deve conter o texto da resposta. "false" e "true" devem ser strings lowercase e não booleanos.\
  Se você indicar "offer_human_attendance" como "true", você deve terminar a sua resposta perguntando ao usuário se ele deseja falar com um atendente. Caso você indique "offer_human_attendance" como "false", você deve omitir toda pergunta que não seja instruída a você dar na resposta. Esse comportamento é necessário dado que se o usuário responder após essa sua resposta concordando em falar com um atendente, ele será transferido.\
  Se você estiver fazendo uma pergunta, preencha o campo "yes_or_no_question" com "true"  se for uma pergunta que a resposta é exclusivamente "sim" ou "não" ou "false" caso contrário.\
  Você deve preencher "is_greeting_response" dependendo se a sua resposta está respondendo uma mensagem de saudação. "true" se for saudação ou "false" se não for.';
}

export const timestampMiniPrompt = (hasTimestamp: boolean) => {
  const now = new Date();
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'full', timeStyle: 'long' }).format(now);
}

export const JSONPrompt = (languages: string[], hasAttendance: boolean, directAttendance: boolean) => `You will generate a JSON in the following format: { "response": "<your answer ${languages.length > 0 ? 'in '+languages.join(' or ')+ ', depending on the language the question was asked (you don\'t know any other language)' : languages[0]} as an automated attendant>", "offer_human_attendance": ${hasAttendance !== false ? '"true"/"false"' : '"false"//(because attendance is disabled)'}, ${!directAttendance ? `"redirect_to_assistant_message":"<"Do you want to talk with an attendant?" variation>",`: ''}, "yes_or_no": "true"/"false" (wether your answer can be replied with "yes" or "no"), "response_language": <language, ISO 3166-1 Alpha-2 format (2 characters)>, "is_greeting_response": "true" or "false" }`;

export const ParaphraseAndTranslatePrompt = (message: string, languages: string[]) => `Rewrite <${message}> ${languages.length > 0 ? 'in '+languages.join(' OR ')+ ', depending on the language the question was asked IN ONLY ONE LANGUAGE' : ''}. Stop right after the rewriting, do not return any extra text.`;

export const inactivePrompt = (message: string) => `Someone has been asked if he/she needs help with something else. Consider its answer: ${message}\n Was the answer negative? Answer with "true" if it was negative or "false" if it wasn't negative or "undefined" if it is unrelated.`

export const formGenerationPrompt = (context: string) => `Generate a form schema (JSON Forms) and a UI schema (JSON Forms) for the following context: ${context}. JSON schema in a field named "schema" and UI schema in a field named "ui_schema".`;

export const autoFillFormPrompt = (schema: object, hints?: string) => `Generate a JSON to fill data for the following JSON Forms schema: "${JSON.stringify(schema)}". ${hints ? `You need to follow the following hints: ${hints}.` : ''}`;

export const autoFillFromHTMLPrompt = (html: string, hints?: string) => `Imagine you're developing an automated form filling system. You received a HTML form to fill with contextual information. The given HTML form ${hints ? 'and an example of context' : ''} is below. Use the HTML form current info ${hints ? 'and the context' : ''} to fill the form's fields and return a JSON with all filled fields. For file inputs you can fill with 'file example'. You should translate the JSON keys to English.

HTML:
${html}${hints ? `\n\nContext: ${hints}` : ''}`;
