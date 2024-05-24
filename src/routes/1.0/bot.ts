import { Router } from 'express';
import { Bots } from '@controllers/Bots';
import { validate } from '@core/validation';
import { createBotSchema, objectIdSchema, updatePromptSchema } from '@root/types/zod';
import { z } from 'zod';
import { camelcaseMiddleware } from '@core/casing';

export const botRouter = Router()
  .post('/', validate({
    body: createBotSchema
  }), camelcaseMiddleware, Bots.createBot)
  .post('/training', validate({
    body: z.object({
      ids: z.string().array()
    })
  }), Bots.getTrainingBots)
  .get('/', validate({
    query: z.object({
      cursor: z.string().optional(),
      size: z.number({ coerce: true }).optional()
    })
  }), Bots.getBots)
  .post('/:id/topK', validate({
    params: z.object({
      id: z.string().uuid().or(objectIdSchema)
    }),
    body: z.object({
      text: z.string().nonempty()
    })
  }), Bots.topK)
  .get('/:id', validate({
    params: z.object({
      id: z.string().uuid().or(objectIdSchema)
    }),
  }), Bots.getBot)
  .put('/:id', validate({
    params: z.object({
      id: objectIdSchema.or(z.string().uuid())
    }),
    body: createBotSchema,
  }), camelcaseMiddleware, Bots.updateBot)
  .delete('/:id', validate({
    params: z.object({
      id: objectIdSchema.or(z.string().uuid())
    })
  }), Bots.deleteBot)
  .put('/:id/update_prompt', validate({
    body: updatePromptSchema,
    params: z.object({
      id: objectIdSchema.or(z.string().uuid())
    })
  }), camelcaseMiddleware, Bots.updatePrompt)
  .post('/:id/get_answer', validate({
    params: z.object({
      id: objectIdSchema.or(z.string().uuid())
    }),
    body: z.object({
      text: z.string().nonempty(),
      user_id: z.string().nonempty()
    })
  }), camelcaseMiddleware, Bots.getAnswer)
  .get('/:id/generate_prompt', validate({
    body: z.object({
      id: z.string().nonempty(),
    }),
    query: z.object({
      text: z.string().nonempty(),
      user_id: z.string().nonempty()
    })
  }), camelcaseMiddleware, Bots.generatePrompt)
  .patch('/:id/temperature/:value', validate({
    params: z.object({
      id: objectIdSchema.or(z.string().uuid()),
      value: z.number({ coerce: true }).min(0).max(1)
    })
  }), Bots.updateOpenAIField('temperature'))
  .patch('/:id/ai/:value', validate({
    params: z.object({
      id: objectIdSchema.or(z.string().uuid()),
      value: z.union([
        z.literal('gpt-3.5-turbo'),
        z.literal('gpt-4o')
      ]),
    }),
  }), Bots.updateOpenAIField('llmModel'))
  .get('/:id/prompt_token_limit', validate({
    params: z.object({
      id: objectIdSchema.or(z.string().uuid()),
    }),
  }), Bots.getPromptTokenLimit)
  .post('/:id/paraphrase', validate({
    params: z.object({
      id: objectIdSchema.or(z.string().uuid()),
    }),
    body: z.object({
      text: z.string().nonempty(),
    }),
  }), Bots.paraphrase)
  .patch('/:id/allow_attendance_on_greeting/:value', validate({
    params: z.object({
      id: objectIdSchema.or(z.string().uuid()),
      value: z.boolean({ coerce: true })
    }),
  }), Bots.updateField('attendanceOnGreeting'))
  .patch('/:id/allow_direct_attendance/:value', validate({
    params: z.object({
      id: objectIdSchema.or(z.string().uuid()),
      value: z.boolean({ coerce: true })
    })
  }), Bots.updateField('directAttendance'))
  .patch('/:id/openai_key/:value', validate({
    params: z.object({
      id: objectIdSchema.or(z.string().uuid()),
      value: z.boolean({ coerce: true })
    })
  }), Bots.updateOpenAIField('openaiKey'))
  .patch('/:id/user_history_time/:value', validate({
    params: z.object({
      id: objectIdSchema.or(z.string().uuid()),
      value: z.boolean({ coerce: true })
    })
  }), Bots.updateField('userHistoryTime'))
  .patch('/:id/job_timings', validate({
    params: z.object({
      id: objectIdSchema.or(z.string().uuid()),
    }),
    body: z.object({
      nps: z.number(),
      inactive: z.number()
    })
  }), Bots.updateJobTimings)
  .patch('/:id/access_control/:value', validate({
    params: z.object({
      id: objectIdSchema.or(z.string().uuid()),
      value: z.boolean({ coerce: true })
    }),
    body: z.object({
      access_control_message: z.string().optional()
    })
  }), camelcaseMiddleware, Bots.updateField('accessControl'))
  .patch('/:id/disabled/:value', validate({
    params: z.object({
      id: objectIdSchema.or(z.string().uuid()),
      value: z.boolean({ coerce: true })
    })
  }), Bots.updateField('disabled'))
  .patch('/:id/gpt_language_detector/:value', validate({
    params: z.object({
      id: objectIdSchema.or(z.string().uuid()),
      value: z.boolean({ coerce: true })
    }),
  }), Bots.updateField('gptLanguageDetector'))
  .patch('/:id/start_message/:value', validate({
    params: z.object({
      id: objectIdSchema.or(z.string().uuid()),
      value: z.string()
    })
  }), Bots.updateField('startMessage'));
