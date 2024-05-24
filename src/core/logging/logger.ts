import pino from 'pino';
import { config as dotenv } from 'dotenv';
dotenv();
import PinoPretty from 'pino-pretty';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOGS_DIR = path.join(__dirname, '../../../', 'logs');

if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR);
}

const logdir = LOGS_DIR;

const levels = {
  http: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60,
}

const config = {
  customLevels: levels,
  useOnlyCustomLevels: true,
  timestamp: () => {
    const today = new Date();
    return `,"timestamp":"${new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString()}"`;
  },
  level: 'info',
};

const createSonicBoom = (destination: string) => pino.destination({ dest: destination, append: true, sync: true });

const streams: Parameters<typeof pino.multistream>[0] = [
  { stream: process.env.NODE_ENV === 'development' ? PinoPretty({
    colorize: true,
    translateTime: true,
  }) : process.stdout},
];
if (process.env.NODE_ENV === 'development') {
  streams.concat(...[
    { level: 30, stream: createSonicBoom(`${logdir}/info.log`) },
    { level: 50, stream: createSonicBoom(`${logdir}/error.log`) },
    { level: 60, stream: createSonicBoom(`${logdir}/fatal.log`) },
  ] as any[]); // needed because of "level" property
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const logger = pino(config, pino.multistream(streams));