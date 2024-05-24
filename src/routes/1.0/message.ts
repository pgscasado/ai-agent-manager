import { Router } from 'express';
import { validate } from '@core/validation'
import { Messages } from '@controllers/Messages';
import { z } from 'zod';
import { objectIdSchema } from '@root/types/zod';
import { camelcaseMiddleware } from '@root/core/casing';

export const messageRouter = Router()
  .post('/:id/get_answer', validate({
    params: z.object({
      id: objectIdSchema.or(z.string().uuid())
    }),
    body: z.object({
      text: z.string().min(1),
      user_id: z.string().min(1)
    })
  }), camelcaseMiddleware, Messages.getAnswer)
  .post('/:botId/bot_message', validate({
    params: z.object({
      botId: objectIdSchema.or(z.string().uuid())
    }),
    body: z.object({
      text: z.string().min(1),
      user_id: z.string().min(1),
      flags: z.string().array().optional()
    })
  }), camelcaseMiddleware, Messages.insertBotMessage)
  .post('/:botId/user_message', validate({
    params: z.object({
      botId: objectIdSchema.or(z.string().uuid())
    }),
    body: z.object({
      text: z.string().min(1),
      user_id: z.string().min(1)
    })
  }), camelcaseMiddleware, Messages.insertUserMessage);