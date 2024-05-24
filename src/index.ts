import { config } from 'dotenv';
config();
const requiredEnvsSchema = z.object({
  PORT: z.number({ coerce: true }),
  NODE_ENV: z.union([z.literal('production'), z.literal('development')]),
  OURS_DEFAULT_OPENAI_KEY: z.string(),
  DATABASE_URL: z.string(),
  DATABASE_NAME: z.string(),
});
requiredEnvsSchema.parse(process.env);

import express from 'express';
import { apiRouter } from '@routes';
import { logRequests } from '@core/logging';
import { logger } from '@core/logging/logger';
import { ai } from '@core/ai';
import { startJobs } from '@core/jobs';
import { transformSnakeCaseMiddleware } from './core/casing';
import { z } from 'zod';

const app = express()
  .set('trust proxy', true)
  .use(transformSnakeCaseMiddleware)
  .use(express.json({
    limit: '200mb'
  }))
  .use(express.urlencoded({ extended: true }))
  .use(logRequests)
  .use(apiRouter)
  .set('port', process.env.PORT || 3000);

app.listen(app.get('port'), async () => {
  logger.info(`[WEB] Server is running <${process.env.NODE_ENV}> on port ${app.get('port')}`);
  await Promise.all([
    (async () => {
      const jobs = await startJobs(); return logger.info(`[JOBS] ${jobs.length} jobs registered!`);
    })(),
    (async () => {
      await ai.getVectorizer((progress) => {
        if (progress.status === 'done') {
          logger.info(`[AI] ${progress.name} successfully loaded from ${progress.file}`);
        } else if (progress.status === 'ready') {
          logger.info(`[AI] ${progress.model} ready!`);
        }
      }); return logger.info(`[AI][Embedding] Vectorizer ready!`);
    })(),
    (async () => {
      await ai.getLanguageDetector((progress) => {
        if (progress.status === 'done') {
          logger.info(`[AI] ${progress.name} successfully loaded from ${progress.file}`);
        } else if (progress.status === 'ready') {
          logger.info(`[AI] ${progress.model} ready!`);
        }
      }); return logger.info(`[AI][Language Detector] Language detector ready!`);
    })(),
    (async () => {
      const sentiment = await ai.getSentimentAnalyzer((progress) => {
        if (progress.status === 'done') {
          logger.info(`[AI] ${progress.name} successfully loaded from ${progress.file}`);
        } else if (progress.status === 'ready') {
          logger.info(`[AI] ${progress.model} ready!`);
        }
      });
      return logger.info(`[AI][Sentiment Analysis] Sentiment analyzer ready!`);
    })(),
  ]);
  logger.info('[WEB] System ready!');
});
