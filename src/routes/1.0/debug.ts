import { Router, RequestHandler } from 'express';
import { validate } from '@core/validation';
import { z } from 'zod';
import { ai } from '@root/core/ai';
import { Bots } from '@root/controllers/Bots';
import { camelcaseMiddleware } from '@root/core/casing';
import { objectIdSchema } from '@root/types/zod';

export const debugRouter = Router()
  .get('/language/:botId?', validate({
    query: z.object({
      text: z.string().min(1),
      gpt: z.boolean({ coerce: true }).optional()
    }),
    params: z.object({
      botId: objectIdSchema.or(z.string().uuid()).optional(),
    })
  }), (async (req, res) => {
    const { text, gpt } = req.query;
    if (gpt === 'true') {
      const languageDetector = await ai.getLanguageDetector(undefined, true);
      const { botId } = req.params;
      const bot = await Bots.functions.findBot(botId);
      if (!bot) {
        return res.status(404).json({ message: 'Bot not found' });
      }
      const result = await languageDetector(bot, text);
      return res.json(result);
    }
    const languageDetector = await ai.getLanguageDetector();
    const result = await languageDetector(text);
    res.json(result);
  }) satisfies RequestHandler<{ botId: string }, any, never, { text: string, gpt?: `${boolean}` }>)
  .get('/:id/generate_prompt', validate({
    body: z.object({
      id: z.string().nonempty(),
    }),
    query: z.object({
      text: z.string().nonempty(),
      user_id: z.string().nonempty()
    })
  }), camelcaseMiddleware, Bots.generatePrompt)
  .post('/tokens', validate({
    body: z.object({
      text: z.string().nonempty(),
    }),
  }), async (req, res) => {
    const tokens = await ai.getTokens(req.body.text);
    res.json({ tokens });
  })
  .get('/sentiment', validate({
    query: z.object({
      text: z.string().min(1)
    })
  }), async (req, res) => {
    const { text } = req.query;
    if (typeof text !== 'string') {
      return res.status(400).json({ msg: 'text must be string' });
    }
    const sentiment = await ai.getSentimentAnalyzer();
    const results = await sentiment(text, { topk: 5 });
    return res.json(ai.parseAsDecision(results[0].label));
  });