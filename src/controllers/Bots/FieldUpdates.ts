import { logger } from '@core/logging/logger';
import prisma, { Prisma } from '@root/prisma';
import { RequestHandler } from '@root/types/express';
import { functions } from '../Bots';

const updateableOpenAIFields = ['temperature', 'openaiKey', 'llmModel'] as const;
type OpenAIField = Omit<NonNullable<Prisma.BotGetPayload<{
  include: {
    openaiConfig: true
  }
}>['openaiConfig']>, 'tempContent'>
type OpenAIUpdateableFields = keyof Pick<
  OpenAIField,
  typeof updateableOpenAIFields[number]
>;
const updateableOpenAIFieldsCoercion: { [k in OpenAIUpdateableFields]: (val: any) => OpenAIField[k] } = {
  llmModel: String,
  openaiKey: String,
  temperature: Number
}
export const updateOpenAIField = <K extends OpenAIUpdateableFields>(field: K) => (async (req, res) => {
  const { id, value } = req.params;
  const bot = await functions.findBot(id);
  const updatedConfig = bot?.openaiConfig as (OpenAIField & { tempContent?: any });
  if (!bot) {
    return res.status(404).json({ message: 'Bot not found' });
  } else if (!updatedConfig?.openaiKey || !updatedConfig?.tempContent) {
    return res.status(400).json({ message: 'Bot not configured' });
  }
  try {
    if (!updateableOpenAIFields.includes(field)) {
      throw Object.defineProperty(new Error('Trying to update invalid or forbidden field'), 'name', { value: 'UpdateForbiddenFieldError'});
    }
    const coercedValue = updateableOpenAIFieldsCoercion[field](value);
    updatedConfig[field] = coercedValue;
    const result = await prisma.bot.update({
      where: {
        id: bot.id,
      },
      data: {
        openaiConfig: nullsToUndefined(updatedConfig),
      },
    });
    res.json(result);
  } catch (e) {
    logger.error(e);
    res.status(500).json(e);
  }
}) satisfies RequestHandler<{ id: string, value: any}>;

const updateableFields = ['attendanceOnGreeting', 'directAttendance', 'hasAttendance', 'textSearch', 'userHistoryTime', 'accessControl', 'disabled', 'gptLanguageDetector', 'startMessage'] as const satisfies (keyof Prisma.BotCreateInput)[];
type BotUpdateableFields = keyof Pick<
  Prisma.BotCreateInput,
  typeof updateableFields[number]
>;
const updateableFieldsCoercion: { [k in BotUpdateableFields]: (val: any) => Prisma.BotCreateInput[k] } = {
  gptLanguageDetector: parseBoolean,
  attendanceOnGreeting: parseBoolean,
  directAttendance: parseBoolean,
  hasAttendance: parseBoolean,
  textSearch: parseBoolean,
  accessControl: parseBoolean,
  disabled: parseBoolean,
  startMessage: (val: any) => typeof val === 'string' && val !== ':unset' ? val : null,
  userHistoryTime: (val: any) => Number(val) || 0
}
export const updateField = <K extends BotUpdateableFields>(field: K) => (async (req, res) => {
  const { id, value } = req.params;
  const bot = await functions.findBot(id);
  if (!bot) {
    return res.status(404).json({ message: 'Bot not found' });
  }
  const query = {
    [`${field}`]: updateableFieldsCoercion[field](value)
  }
  try {
    if (!updateableFields.includes(field)) {
      throw Object.defineProperty(new Error('Trying to update invalid or forbidden field'), 'name', { value: 'UpdateForbiddenFieldError'});
    }
    const result = await prisma.bot.update({
      where: {
        id: bot.id,
      },
      data: {...query, ...req.body},
    });
    res.json(result);
  } catch (e) {
    logger.error(e);
    const knownError = e as Error;
    switch (true) {
      case knownError.name === 'UpdateForbiddenFieldError':
        res.status(403).json({ error: knownError.name, message: knownError.message });
      default: 
        res.status(500).json(e);
    }
  }
}) satisfies RequestHandler<{ id: string, value: `${boolean}` }>;

export const updateJobTimings: RequestHandler<{ nps: number, inactive: number }, { id: string }> = async (req, res) => {
  const { id } = req.params;
  const timings = req.body;
  logger.info(timings);
  const bot = await functions.findBot(id);
  if (!bot) {
    return res.status(404).json({ message: 'Bot not found' });
  }
  try {
    const result = await prisma.bot.update({
      where: {
        id: bot.id
      },
      data: {
        jobTimings: {
          npsMinutes: timings.nps,
          inactiveMinutes: timings.inactive
        }
      }
    })
    res.json(result);
  } catch (e) {
    logger.error(e);
    res.status(500).json(e);
  }
}

type RecursivelyReplaceNullWithUndefined<T> = T extends null
  ? undefined
  : T extends Date
  ? T
  : {
      [K in keyof T]: T[K] extends (infer U)[]
        ? RecursivelyReplaceNullWithUndefined<U>[]
        : RecursivelyReplaceNullWithUndefined<T[K]>;
    };

export function nullsToUndefined<T>(obj: T): RecursivelyReplaceNullWithUndefined<T> {
  if (obj === null) {
    return undefined as any;
  }

  if (obj?.constructor.name === "Object") {
    for (let key in obj) {
      obj[key] = nullsToUndefined(obj[key]) as any;
    }
  }
  return obj as any;
}

function parseBoolean(str: any) {
  switch(String(str).toLowerCase()) {
    case 'undefined':
    case 'null': 
    case 'nan': 
    case 'false': 
    case 'no': 
    case 'f': 
    case 'n': 
    case '0': 
    case 'off': 
    case '':
        return false;
    default:
        return true;
  };
};