import { z } from 'zod';
import { ObjectId } from 'bson';

export const objectIdSchema = z.string().refine(ObjectId.isValid, {
  message: 'Invalid ObjectId',
});

export const updatePromptSchema = z.object({
  language: z.object({
    default_language: z.string(),
    allowed_languages: z.string().array(),
  }).optional(),
  bot_name: z.string(),
  source_text: z.string(),
  source_urls: z.string().array().optional(),
  source_files: z.string().array().optional(),
  behavioral_rules: z.string().optional().nullable()
});

export const createBotSchema = z.object({
  identifier: z.string().optional(),
  id: z.string().optional(),
  timestamp: z.string().optional(),
  openai_config: z.object({
    llm_model: z.string(),
    message_buffer: z.number(),
    openai_key: z.string(),
    temp_content: z.object({
      language: z.object({
        default_language: z.string().optional(),
        allowed_languages: z.string().array().optional(),
      }).optional().nullable(),
      bot_name: z.string().optional(),
      source_text: z.string().optional(),
      source_urls: z.string().array().optional(),
      source_files: z.string().array().optional(),
      behavioral_rules: z.string().optional().nullable(),
    }),
  }),
});
