import { z } from 'zod';
import { Prisma } from '@prisma/client';

/////////////////////////////////////////
// HELPER FUNCTIONS
/////////////////////////////////////////

// JSON
//------------------------------------------------------

export type NullableJsonInput = Prisma.JsonValue | null | 'JsonNull' | 'DbNull' | Prisma.NullTypes.DbNull | Prisma.NullTypes.JsonNull;

export const transformJsonNull = (v?: NullableJsonInput) => {
  if (!v || v === 'DbNull') return Prisma.DbNull;
  if (v === 'JsonNull') return Prisma.JsonNull;
  return v;
};

export const JsonValue: z.ZodType<Prisma.JsonValue> = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.lazy(() => z.array(JsonValue)),
  z.lazy(() => z.record(JsonValue)),
]);

export type JsonValueType = z.infer<typeof JsonValue>;

export const NullableJsonValue = z
  .union([JsonValue, z.literal('DbNull'), z.literal('JsonNull')])
  .nullable()
  .transform((v) => transformJsonNull(v));

export type NullableJsonValueType = z.infer<typeof NullableJsonValue>;

export const InputJsonValue: z.ZodType<Prisma.InputJsonValue> = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.lazy(() => z.array(InputJsonValue.nullable())),
  z.lazy(() => z.record(InputJsonValue.nullable())),
]);

export type InputJsonValueType = z.infer<typeof InputJsonValue>;


/////////////////////////////////////////
// ENUMS
/////////////////////////////////////////

export const BotScalarFieldEnumSchema = z.enum(['id','identifier','accessControl','accessControlMessage','userHistoryTime','gptLanguageDetector','hasAttendance','attendanceOnGreeting','directAttendance','name','timestamp','tokenLimit','totalTokens','textSearch','disabled','startMessage']);

export const MessageScalarFieldEnumSchema = z.enum(['id','botId','message','userId','isResponse','response','timestamp','flags']);

export const ChatGPTCallScalarFieldEnumSchema = z.enum(['id','botId','promptTokens','responseTokens','totalTokens','apiKeyHint','model','timestamp','latency']);

export const SortOrderSchema = z.enum(['asc','desc']);

export const QueryModeSchema = z.enum(['default','insensitive']);

export const TrainingStatusSchema = z.enum(['ON_TRAINING','FINISHED','ERROR']);

export type TrainingStatusType = `${z.infer<typeof TrainingStatusSchema>}`

/////////////////////////////////////////
// MODELS
/////////////////////////////////////////

/////////////////////////////////////////
// BOT SCHEMA
/////////////////////////////////////////

export const BotSchema = z.object({
  id: z.string(),
  identifier: z.string(),
  accessControl: z.boolean(),
  accessControlMessage: z.string().nullable(),
  userHistoryTime: z.number().int(),
  gptLanguageDetector: z.boolean(),
  hasAttendance: z.boolean(),
  attendanceOnGreeting: z.boolean(),
  directAttendance: z.boolean(),
  name: z.string(),
  timestamp: z.coerce.date(),
  tokenLimit: z.number().int(),
  totalTokens: z.number().int(),
  textSearch: z.boolean(),
  disabled: z.boolean(),
  startMessage: z.string().nullable(),
})

export type Bot = z.infer<typeof BotSchema>

// BOT OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const BotOptionalDefaultsSchema = BotSchema.merge(z.object({
  id: z.string().optional(),
  accessControl: z.boolean().optional(),
  userHistoryTime: z.number().int().optional(),
  gptLanguageDetector: z.boolean().optional(),
  hasAttendance: z.boolean().optional(),
  attendanceOnGreeting: z.boolean().optional(),
  directAttendance: z.boolean().optional(),
  name: z.string().optional(),
  timestamp: z.coerce.date().optional(),
  tokenLimit: z.number().int().optional(),
  totalTokens: z.number().int().optional(),
  textSearch: z.boolean().optional(),
  disabled: z.boolean().optional(),
}))

export type BotOptionalDefaults = z.infer<typeof BotOptionalDefaultsSchema>

/////////////////////////////////////////
// MESSAGE SCHEMA
/////////////////////////////////////////

export const MessageSchema = z.object({
  id: z.string(),
  botId: z.string(),
  message: z.string(),
  userId: z.string(),
  isResponse: z.boolean(),
  response: z.string(),
  timestamp: z.coerce.date(),
  flags: InputJsonValue,
})

export type Message = z.infer<typeof MessageSchema>

// MESSAGE OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const MessageOptionalDefaultsSchema = MessageSchema.merge(z.object({
  id: z.string().optional(),
  timestamp: z.coerce.date().optional(),
  flags: InputJsonValue,
}))

export type MessageOptionalDefaults = z.infer<typeof MessageOptionalDefaultsSchema>

/////////////////////////////////////////
// CHAT GPT CALL SCHEMA
/////////////////////////////////////////

export const ChatGPTCallSchema = z.object({
  id: z.string(),
  botId: z.string(),
  promptTokens: z.number().int(),
  responseTokens: z.number().int(),
  totalTokens: z.number().int(),
  apiKeyHint: z.string(),
  model: z.string(),
  timestamp: z.coerce.date(),
  latency: z.number().int(),
})

export type ChatGPTCall = z.infer<typeof ChatGPTCallSchema>

// CHAT GPT CALL OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const ChatGPTCallOptionalDefaultsSchema = ChatGPTCallSchema.merge(z.object({
  id: z.string().optional(),
  timestamp: z.coerce.date().optional(),
}))

export type ChatGPTCallOptionalDefaults = z.infer<typeof ChatGPTCallOptionalDefaultsSchema>

/////////////////////////////////////////
// MONGODB TYPES
/////////////////////////////////////////
// JOB TIMINGS
//------------------------------------------------------


/////////////////////////////////////////
// JOB TIMINGS SCHEMA
/////////////////////////////////////////

export const JobTimingsSchema = z.object({
  defaultJobMinutes: z.number().int(),
})

export type JobTimings = z.infer<typeof JobTimingsSchema>

// JOB TIMINGS OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const JobTimingsOptionalDefaultsSchema = JobTimingsSchema.merge(z.object({
  defaultJobMinutes: z.number().int().optional(),
}))

export type JobTimingsOptionalDefaults = z.infer<typeof JobTimingsOptionalDefaultsSchema>
// TRAINING INFO
//------------------------------------------------------


/////////////////////////////////////////
// TRAINING INFO SCHEMA
/////////////////////////////////////////

export const TrainingInfoSchema = z.object({
  status: TrainingStatusSchema,
  errorMessages: z.string().array(),
  dataJson: z.string(),
  duration: z.number().int(),
  timestamp: z.coerce.date(),
})

export type TrainingInfo = z.infer<typeof TrainingInfoSchema>

// TRAINING INFO OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const TrainingInfoOptionalDefaultsSchema = TrainingInfoSchema.merge(z.object({
  duration: z.number().int().optional(),
  timestamp: z.coerce.date().optional(),
}))

export type TrainingInfoOptionalDefaults = z.infer<typeof TrainingInfoOptionalDefaultsSchema>
// OPEN AI CONFIG
//------------------------------------------------------


/////////////////////////////////////////
// OPEN AI CONFIG SCHEMA
/////////////////////////////////////////

export const OpenAIConfigSchema = z.object({
  temperature: z.number(),
  messageBuffer: z.number().int(),
  openaiKey: z.string(),
  llmModel: z.string(),
})

export type OpenAIConfig = z.infer<typeof OpenAIConfigSchema>

// OPEN AI CONFIG OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const OpenAIConfigOptionalDefaultsSchema = OpenAIConfigSchema.merge(z.object({
  temperature: z.number().optional(),
  messageBuffer: z.number().int().optional(),
  llmModel: z.string().optional(),
}))

export type OpenAIConfigOptionalDefaults = z.infer<typeof OpenAIConfigOptionalDefaultsSchema>
// CHAT GPT PROMPT CONTENT
//------------------------------------------------------


/////////////////////////////////////////
// CHAT GPT PROMPT CONTENT SCHEMA
/////////////////////////////////////////

export const ChatGPTPromptContentSchema = z.object({
  botName: z.string(),
  sourceText: z.string(),
  sourceUrls: z.string().array(),
  sourceFiles: z.string().array(),
  behavioralRules: z.string().nullable(),
})

export type ChatGPTPromptContent = z.infer<typeof ChatGPTPromptContentSchema>

// CHAT GPT PROMPT CONTENT OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const ChatGPTPromptContentOptionalDefaultsSchema = ChatGPTPromptContentSchema.merge(z.object({
}))

export type ChatGPTPromptContentOptionalDefaults = z.infer<typeof ChatGPTPromptContentOptionalDefaultsSchema>
// CHAT GPT LANGUAGE CONFIG
//------------------------------------------------------


/////////////////////////////////////////
// CHAT GPT LANGUAGE CONFIG SCHEMA
/////////////////////////////////////////

export const ChatGPTLanguageConfigSchema = z.object({
  allowedLanguages: z.string().array(),
  defaultLanguage: z.string(),
})

export type ChatGPTLanguageConfig = z.infer<typeof ChatGPTLanguageConfigSchema>

// CHAT GPT LANGUAGE CONFIG OPTIONAL DEFAULTS SCHEMA
//------------------------------------------------------

export const ChatGPTLanguageConfigOptionalDefaultsSchema = ChatGPTLanguageConfigSchema.merge(z.object({
}))

export type ChatGPTLanguageConfigOptionalDefaults = z.infer<typeof ChatGPTLanguageConfigOptionalDefaultsSchema>

/////////////////////////////////////////
// SELECT & INCLUDE
/////////////////////////////////////////

// BOT
//------------------------------------------------------

export const BotIncludeSchema: z.ZodType<Prisma.BotInclude> = z.object({
}).strict()

export const BotArgsSchema: z.ZodType<Prisma.BotDefaultArgs> = z.object({
  select: z.lazy(() => BotSelectSchema).optional(),
  include: z.lazy(() => BotIncludeSchema).optional(),
}).strict();

export const BotSelectSchema: z.ZodType<Prisma.BotSelect> = z.object({
  id: z.boolean().optional(),
  identifier: z.boolean().optional(),
  accessControl: z.boolean().optional(),
  accessControlMessage: z.boolean().optional(),
  userHistoryTime: z.boolean().optional(),
  gptLanguageDetector: z.boolean().optional(),
  hasAttendance: z.boolean().optional(),
  attendanceOnGreeting: z.boolean().optional(),
  directAttendance: z.boolean().optional(),
  name: z.boolean().optional(),
  timestamp: z.boolean().optional(),
  tokenLimit: z.boolean().optional(),
  totalTokens: z.boolean().optional(),
  textSearch: z.boolean().optional(),
  trainingInfo: z.union([z.boolean(),z.lazy(() => TrainingInfoArgsSchema)]).optional(),
  openaiConfig: z.union([z.boolean(),z.lazy(() => OpenAIConfigArgsSchema)]).optional(),
  jobTimings: z.union([z.boolean(),z.lazy(() => JobTimingsArgsSchema)]).optional(),
  disabled: z.boolean().optional(),
  startMessage: z.boolean().optional(),
}).strict()

// MESSAGE
//------------------------------------------------------

export const MessageArgsSchema: z.ZodType<Prisma.MessageDefaultArgs> = z.object({
  select: z.lazy(() => MessageSelectSchema).optional(),
}).strict();

export const MessageSelectSchema: z.ZodType<Prisma.MessageSelect> = z.object({
  id: z.boolean().optional(),
  botId: z.boolean().optional(),
  message: z.boolean().optional(),
  userId: z.boolean().optional(),
  isResponse: z.boolean().optional(),
  response: z.boolean().optional(),
  timestamp: z.boolean().optional(),
  flags: z.boolean().optional(),
}).strict()

// CHAT GPT CALL
//------------------------------------------------------

export const ChatGPTCallArgsSchema: z.ZodType<Prisma.ChatGPTCallDefaultArgs> = z.object({
  select: z.lazy(() => ChatGPTCallSelectSchema).optional(),
}).strict();

export const ChatGPTCallSelectSchema: z.ZodType<Prisma.ChatGPTCallSelect> = z.object({
  id: z.boolean().optional(),
  botId: z.boolean().optional(),
  promptTokens: z.boolean().optional(),
  responseTokens: z.boolean().optional(),
  totalTokens: z.boolean().optional(),
  apiKeyHint: z.boolean().optional(),
  model: z.boolean().optional(),
  timestamp: z.boolean().optional(),
  latency: z.boolean().optional(),
}).strict()

// TRAINING INFO
//------------------------------------------------------

export const TrainingInfoArgsSchema: z.ZodType<Prisma.TrainingInfoDefaultArgs> = z.object({
  select: z.lazy(() => TrainingInfoSelectSchema).optional(),
}).strict();

export const TrainingInfoSelectSchema: z.ZodType<Prisma.TrainingInfoSelect> = z.object({
  status: z.boolean().optional(),
  errorMessages: z.boolean().optional(),
  dataJson: z.boolean().optional(),
  duration: z.boolean().optional(),
  timestamp: z.boolean().optional(),
}).strict()

// OPEN AI CONFIG
//------------------------------------------------------

export const OpenAIConfigIncludeSchema: z.ZodType<Prisma.OpenAIConfigInclude> = z.object({
}).strict()

export const OpenAIConfigArgsSchema: z.ZodType<Prisma.OpenAIConfigDefaultArgs> = z.object({
  select: z.lazy(() => OpenAIConfigSelectSchema).optional(),
  include: z.lazy(() => OpenAIConfigIncludeSchema).optional(),
}).strict();

export const OpenAIConfigSelectSchema: z.ZodType<Prisma.OpenAIConfigSelect> = z.object({
  temperature: z.boolean().optional(),
  messageBuffer: z.boolean().optional(),
  openaiKey: z.boolean().optional(),
  llmModel: z.boolean().optional(),
  tempContent: z.union([z.boolean(),z.lazy(() => ChatGPTPromptContentArgsSchema)]).optional(),
}).strict()

// JOB TIMINGS
//------------------------------------------------------

export const JobTimingsArgsSchema: z.ZodType<Prisma.JobTimingsDefaultArgs> = z.object({
  select: z.lazy(() => JobTimingsSelectSchema).optional(),
}).strict();

export const JobTimingsSelectSchema: z.ZodType<Prisma.JobTimingsSelect> = z.object({
  defaultJobMinutes: z.boolean().optional(),
}).strict()

// CHAT GPT PROMPT CONTENT
//------------------------------------------------------

export const ChatGPTPromptContentIncludeSchema: z.ZodType<Prisma.ChatGPTPromptContentInclude> = z.object({
}).strict()

export const ChatGPTPromptContentArgsSchema: z.ZodType<Prisma.ChatGPTPromptContentDefaultArgs> = z.object({
  select: z.lazy(() => ChatGPTPromptContentSelectSchema).optional(),
  include: z.lazy(() => ChatGPTPromptContentIncludeSchema).optional(),
}).strict();

export const ChatGPTPromptContentSelectSchema: z.ZodType<Prisma.ChatGPTPromptContentSelect> = z.object({
  botName: z.boolean().optional(),
  sourceText: z.boolean().optional(),
  sourceUrls: z.boolean().optional(),
  sourceFiles: z.boolean().optional(),
  behavioralRules: z.boolean().optional(),
  language: z.union([z.boolean(),z.lazy(() => ChatGPTLanguageConfigArgsSchema)]).optional(),
}).strict()

// CHAT GPT LANGUAGE CONFIG
//------------------------------------------------------

export const ChatGPTLanguageConfigArgsSchema: z.ZodType<Prisma.ChatGPTLanguageConfigDefaultArgs> = z.object({
  select: z.lazy(() => ChatGPTLanguageConfigSelectSchema).optional(),
}).strict();

export const ChatGPTLanguageConfigSelectSchema: z.ZodType<Prisma.ChatGPTLanguageConfigSelect> = z.object({
  allowedLanguages: z.boolean().optional(),
  defaultLanguage: z.boolean().optional(),
}).strict()


/////////////////////////////////////////
// INPUT TYPES
/////////////////////////////////////////

export const BotWhereInputSchema: z.ZodType<Prisma.BotWhereInput> = z.object({
  AND: z.union([ z.lazy(() => BotWhereInputSchema),z.lazy(() => BotWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => BotWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => BotWhereInputSchema),z.lazy(() => BotWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  identifier: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  accessControl: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  accessControlMessage: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  userHistoryTime: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  gptLanguageDetector: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  hasAttendance: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  attendanceOnGreeting: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  directAttendance: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  timestamp: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  tokenLimit: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  totalTokens: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  textSearch: z.union([ z.lazy(() => BoolNullableFilterSchema),z.boolean() ]).optional().nullable(),
  trainingInfo: z.union([ z.lazy(() => TrainingInfoNullableCompositeFilterSchema),z.lazy(() => TrainingInfoObjectEqualityInputSchema) ]).optional().nullable(),
  openaiConfig: z.union([ z.lazy(() => OpenAIConfigNullableCompositeFilterSchema),z.lazy(() => OpenAIConfigObjectEqualityInputSchema) ]).optional().nullable(),
  jobTimings: z.union([ z.lazy(() => JobTimingsNullableCompositeFilterSchema),z.lazy(() => JobTimingsObjectEqualityInputSchema) ]).optional().nullable(),
  disabled: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  startMessage: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
}).strict();

export const BotOrderByWithRelationInputSchema: z.ZodType<Prisma.BotOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  identifier: z.lazy(() => SortOrderSchema).optional(),
  accessControl: z.lazy(() => SortOrderSchema).optional(),
  accessControlMessage: z.lazy(() => SortOrderSchema).optional(),
  userHistoryTime: z.lazy(() => SortOrderSchema).optional(),
  gptLanguageDetector: z.lazy(() => SortOrderSchema).optional(),
  hasAttendance: z.lazy(() => SortOrderSchema).optional(),
  attendanceOnGreeting: z.lazy(() => SortOrderSchema).optional(),
  directAttendance: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  timestamp: z.lazy(() => SortOrderSchema).optional(),
  tokenLimit: z.lazy(() => SortOrderSchema).optional(),
  totalTokens: z.lazy(() => SortOrderSchema).optional(),
  textSearch: z.lazy(() => SortOrderSchema).optional(),
  trainingInfo: z.lazy(() => TrainingInfoOrderByInputSchema).optional(),
  openaiConfig: z.lazy(() => OpenAIConfigOrderByInputSchema).optional(),
  jobTimings: z.lazy(() => JobTimingsOrderByInputSchema).optional(),
  disabled: z.lazy(() => SortOrderSchema).optional(),
  startMessage: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const BotWhereUniqueInputSchema: z.ZodType<Prisma.BotWhereUniqueInput> = z.union([
  z.object({
    id: z.string(),
    identifier: z.string()
  }),
  z.object({
    id: z.string(),
  }),
  z.object({
    identifier: z.string(),
  }),
])
.and(z.object({
  id: z.string().optional(),
  identifier: z.string().optional(),
  AND: z.union([ z.lazy(() => BotWhereInputSchema),z.lazy(() => BotWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => BotWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => BotWhereInputSchema),z.lazy(() => BotWhereInputSchema).array() ]).optional(),
  accessControl: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  accessControlMessage: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  userHistoryTime: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  gptLanguageDetector: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  hasAttendance: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  attendanceOnGreeting: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  directAttendance: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  timestamp: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  tokenLimit: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  totalTokens: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  textSearch: z.union([ z.lazy(() => BoolNullableFilterSchema),z.boolean() ]).optional().nullable(),
  trainingInfo: z.union([ z.lazy(() => TrainingInfoNullableCompositeFilterSchema),z.lazy(() => TrainingInfoObjectEqualityInputSchema) ]).optional().nullable(),
  openaiConfig: z.union([ z.lazy(() => OpenAIConfigNullableCompositeFilterSchema),z.lazy(() => OpenAIConfigObjectEqualityInputSchema) ]).optional().nullable(),
  jobTimings: z.union([ z.lazy(() => JobTimingsNullableCompositeFilterSchema),z.lazy(() => JobTimingsObjectEqualityInputSchema) ]).optional().nullable(),
  disabled: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  startMessage: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
}).strict());

export const BotOrderByWithAggregationInputSchema: z.ZodType<Prisma.BotOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  identifier: z.lazy(() => SortOrderSchema).optional(),
  accessControl: z.lazy(() => SortOrderSchema).optional(),
  accessControlMessage: z.lazy(() => SortOrderSchema).optional(),
  userHistoryTime: z.lazy(() => SortOrderSchema).optional(),
  gptLanguageDetector: z.lazy(() => SortOrderSchema).optional(),
  hasAttendance: z.lazy(() => SortOrderSchema).optional(),
  attendanceOnGreeting: z.lazy(() => SortOrderSchema).optional(),
  directAttendance: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  timestamp: z.lazy(() => SortOrderSchema).optional(),
  tokenLimit: z.lazy(() => SortOrderSchema).optional(),
  totalTokens: z.lazy(() => SortOrderSchema).optional(),
  textSearch: z.lazy(() => SortOrderSchema).optional(),
  disabled: z.lazy(() => SortOrderSchema).optional(),
  startMessage: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => BotCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => BotAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => BotMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => BotMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => BotSumOrderByAggregateInputSchema).optional()
}).strict();

export const BotScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.BotScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => BotScalarWhereWithAggregatesInputSchema),z.lazy(() => BotScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => BotScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => BotScalarWhereWithAggregatesInputSchema),z.lazy(() => BotScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  identifier: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  accessControl: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
  accessControlMessage: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  userHistoryTime: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  gptLanguageDetector: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
  hasAttendance: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
  attendanceOnGreeting: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
  directAttendance: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
  name: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  timestamp: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  tokenLimit: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  totalTokens: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  textSearch: z.union([ z.lazy(() => BoolNullableWithAggregatesFilterSchema),z.boolean() ]).optional().nullable(),
  disabled: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
  startMessage: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
}).strict();

export const MessageWhereInputSchema: z.ZodType<Prisma.MessageWhereInput> = z.object({
  AND: z.union([ z.lazy(() => MessageWhereInputSchema),z.lazy(() => MessageWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => MessageWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => MessageWhereInputSchema),z.lazy(() => MessageWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  botId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  message: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  isResponse: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  response: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  timestamp: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  flags: z.lazy(() => JsonFilterSchema).optional()
}).strict();

export const MessageOrderByWithRelationInputSchema: z.ZodType<Prisma.MessageOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  botId: z.lazy(() => SortOrderSchema).optional(),
  message: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  isResponse: z.lazy(() => SortOrderSchema).optional(),
  response: z.lazy(() => SortOrderSchema).optional(),
  timestamp: z.lazy(() => SortOrderSchema).optional(),
  flags: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const MessageWhereUniqueInputSchema: z.ZodType<Prisma.MessageWhereUniqueInput> = z.object({
  id: z.string()
})
.and(z.object({
  id: z.string().optional(),
  AND: z.union([ z.lazy(() => MessageWhereInputSchema),z.lazy(() => MessageWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => MessageWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => MessageWhereInputSchema),z.lazy(() => MessageWhereInputSchema).array() ]).optional(),
  botId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  message: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  isResponse: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  response: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  timestamp: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  flags: z.lazy(() => JsonFilterSchema).optional()
}).strict());

export const MessageOrderByWithAggregationInputSchema: z.ZodType<Prisma.MessageOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  botId: z.lazy(() => SortOrderSchema).optional(),
  message: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  isResponse: z.lazy(() => SortOrderSchema).optional(),
  response: z.lazy(() => SortOrderSchema).optional(),
  timestamp: z.lazy(() => SortOrderSchema).optional(),
  flags: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => MessageCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => MessageMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => MessageMinOrderByAggregateInputSchema).optional()
}).strict();

export const MessageScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.MessageScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => MessageScalarWhereWithAggregatesInputSchema),z.lazy(() => MessageScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => MessageScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => MessageScalarWhereWithAggregatesInputSchema),z.lazy(() => MessageScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  botId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  message: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  isResponse: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema),z.boolean() ]).optional(),
  response: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  timestamp: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  flags: z.lazy(() => JsonWithAggregatesFilterSchema).optional()
}).strict();

export const ChatGPTCallWhereInputSchema: z.ZodType<Prisma.ChatGPTCallWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ChatGPTCallWhereInputSchema),z.lazy(() => ChatGPTCallWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ChatGPTCallWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ChatGPTCallWhereInputSchema),z.lazy(() => ChatGPTCallWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  botId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  promptTokens: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  responseTokens: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  totalTokens: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  apiKeyHint: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  model: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  timestamp: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  latency: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
}).strict();

export const ChatGPTCallOrderByWithRelationInputSchema: z.ZodType<Prisma.ChatGPTCallOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  botId: z.lazy(() => SortOrderSchema).optional(),
  promptTokens: z.lazy(() => SortOrderSchema).optional(),
  responseTokens: z.lazy(() => SortOrderSchema).optional(),
  totalTokens: z.lazy(() => SortOrderSchema).optional(),
  apiKeyHint: z.lazy(() => SortOrderSchema).optional(),
  model: z.lazy(() => SortOrderSchema).optional(),
  timestamp: z.lazy(() => SortOrderSchema).optional(),
  latency: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ChatGPTCallWhereUniqueInputSchema: z.ZodType<Prisma.ChatGPTCallWhereUniqueInput> = z.object({
  id: z.string()
})
.and(z.object({
  id: z.string().optional(),
  AND: z.union([ z.lazy(() => ChatGPTCallWhereInputSchema),z.lazy(() => ChatGPTCallWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ChatGPTCallWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ChatGPTCallWhereInputSchema),z.lazy(() => ChatGPTCallWhereInputSchema).array() ]).optional(),
  botId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  promptTokens: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  responseTokens: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  totalTokens: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
  apiKeyHint: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  model: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  timestamp: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  latency: z.union([ z.lazy(() => IntFilterSchema),z.number().int() ]).optional(),
}).strict());

export const ChatGPTCallOrderByWithAggregationInputSchema: z.ZodType<Prisma.ChatGPTCallOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  botId: z.lazy(() => SortOrderSchema).optional(),
  promptTokens: z.lazy(() => SortOrderSchema).optional(),
  responseTokens: z.lazy(() => SortOrderSchema).optional(),
  totalTokens: z.lazy(() => SortOrderSchema).optional(),
  apiKeyHint: z.lazy(() => SortOrderSchema).optional(),
  model: z.lazy(() => SortOrderSchema).optional(),
  timestamp: z.lazy(() => SortOrderSchema).optional(),
  latency: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => ChatGPTCallCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => ChatGPTCallAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => ChatGPTCallMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => ChatGPTCallMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => ChatGPTCallSumOrderByAggregateInputSchema).optional()
}).strict();

export const ChatGPTCallScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.ChatGPTCallScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => ChatGPTCallScalarWhereWithAggregatesInputSchema),z.lazy(() => ChatGPTCallScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => ChatGPTCallScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ChatGPTCallScalarWhereWithAggregatesInputSchema),z.lazy(() => ChatGPTCallScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  botId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  promptTokens: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  responseTokens: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  totalTokens: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
  apiKeyHint: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  model: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  timestamp: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  latency: z.union([ z.lazy(() => IntWithAggregatesFilterSchema),z.number() ]).optional(),
}).strict();

export const BotCreateInputSchema: z.ZodType<Prisma.BotCreateInput> = z.object({
  id: z.string().optional(),
  identifier: z.string(),
  accessControl: z.boolean().optional(),
  accessControlMessage: z.string().optional().nullable(),
  userHistoryTime: z.number().int().optional(),
  gptLanguageDetector: z.boolean().optional(),
  hasAttendance: z.boolean().optional(),
  attendanceOnGreeting: z.boolean().optional(),
  directAttendance: z.boolean().optional(),
  name: z.string().optional(),
  timestamp: z.coerce.date().optional(),
  tokenLimit: z.number().int().optional(),
  totalTokens: z.number().int().optional(),
  textSearch: z.boolean().optional().nullable(),
  trainingInfo: z.union([ z.lazy(() => TrainingInfoNullableCreateEnvelopeInputSchema),z.lazy(() => TrainingInfoCreateInputSchema) ]).optional().nullable(),
  openaiConfig: z.union([ z.lazy(() => OpenAIConfigNullableCreateEnvelopeInputSchema),z.lazy(() => OpenAIConfigCreateInputSchema) ]).optional().nullable(),
  jobTimings: z.union([ z.lazy(() => JobTimingsNullableCreateEnvelopeInputSchema),z.lazy(() => JobTimingsCreateInputSchema) ]).optional().nullable(),
  disabled: z.boolean().optional(),
  startMessage: z.string().optional().nullable()
}).strict();

export const BotUncheckedCreateInputSchema: z.ZodType<Prisma.BotUncheckedCreateInput> = z.object({
  id: z.string().optional(),
  identifier: z.string(),
  accessControl: z.boolean().optional(),
  accessControlMessage: z.string().optional().nullable(),
  userHistoryTime: z.number().int().optional(),
  gptLanguageDetector: z.boolean().optional(),
  hasAttendance: z.boolean().optional(),
  attendanceOnGreeting: z.boolean().optional(),
  directAttendance: z.boolean().optional(),
  name: z.string().optional(),
  timestamp: z.coerce.date().optional(),
  tokenLimit: z.number().int().optional(),
  totalTokens: z.number().int().optional(),
  textSearch: z.boolean().optional().nullable(),
  trainingInfo: z.union([ z.lazy(() => TrainingInfoNullableCreateEnvelopeInputSchema),z.lazy(() => TrainingInfoCreateInputSchema) ]).optional().nullable(),
  openaiConfig: z.union([ z.lazy(() => OpenAIConfigNullableCreateEnvelopeInputSchema),z.lazy(() => OpenAIConfigCreateInputSchema) ]).optional().nullable(),
  jobTimings: z.union([ z.lazy(() => JobTimingsNullableCreateEnvelopeInputSchema),z.lazy(() => JobTimingsCreateInputSchema) ]).optional().nullable(),
  disabled: z.boolean().optional(),
  startMessage: z.string().optional().nullable()
}).strict();

export const BotUpdateInputSchema: z.ZodType<Prisma.BotUpdateInput> = z.object({
  identifier: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  accessControl: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  accessControlMessage: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  userHistoryTime: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  gptLanguageDetector: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  hasAttendance: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  attendanceOnGreeting: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  directAttendance: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  tokenLimit: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  totalTokens: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  textSearch: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  trainingInfo: z.union([ z.lazy(() => TrainingInfoNullableUpdateEnvelopeInputSchema),z.lazy(() => TrainingInfoCreateInputSchema) ]).optional().nullable(),
  openaiConfig: z.union([ z.lazy(() => OpenAIConfigNullableUpdateEnvelopeInputSchema),z.lazy(() => OpenAIConfigCreateInputSchema) ]).optional().nullable(),
  jobTimings: z.union([ z.lazy(() => JobTimingsNullableUpdateEnvelopeInputSchema),z.lazy(() => JobTimingsCreateInputSchema) ]).optional().nullable(),
  disabled: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  startMessage: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const BotUncheckedUpdateInputSchema: z.ZodType<Prisma.BotUncheckedUpdateInput> = z.object({
  identifier: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  accessControl: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  accessControlMessage: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  userHistoryTime: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  gptLanguageDetector: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  hasAttendance: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  attendanceOnGreeting: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  directAttendance: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  tokenLimit: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  totalTokens: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  textSearch: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  trainingInfo: z.union([ z.lazy(() => TrainingInfoNullableUpdateEnvelopeInputSchema),z.lazy(() => TrainingInfoCreateInputSchema) ]).optional().nullable(),
  openaiConfig: z.union([ z.lazy(() => OpenAIConfigNullableUpdateEnvelopeInputSchema),z.lazy(() => OpenAIConfigCreateInputSchema) ]).optional().nullable(),
  jobTimings: z.union([ z.lazy(() => JobTimingsNullableUpdateEnvelopeInputSchema),z.lazy(() => JobTimingsCreateInputSchema) ]).optional().nullable(),
  disabled: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  startMessage: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const BotCreateManyInputSchema: z.ZodType<Prisma.BotCreateManyInput> = z.object({
  id: z.string().optional(),
  identifier: z.string(),
  accessControl: z.boolean().optional(),
  accessControlMessage: z.string().optional().nullable(),
  userHistoryTime: z.number().int().optional(),
  gptLanguageDetector: z.boolean().optional(),
  hasAttendance: z.boolean().optional(),
  attendanceOnGreeting: z.boolean().optional(),
  directAttendance: z.boolean().optional(),
  name: z.string().optional(),
  timestamp: z.coerce.date().optional(),
  tokenLimit: z.number().int().optional(),
  totalTokens: z.number().int().optional(),
  textSearch: z.boolean().optional().nullable(),
  trainingInfo: z.union([ z.lazy(() => TrainingInfoNullableCreateEnvelopeInputSchema),z.lazy(() => TrainingInfoCreateInputSchema) ]).optional().nullable(),
  openaiConfig: z.union([ z.lazy(() => OpenAIConfigNullableCreateEnvelopeInputSchema),z.lazy(() => OpenAIConfigCreateInputSchema) ]).optional().nullable(),
  jobTimings: z.union([ z.lazy(() => JobTimingsNullableCreateEnvelopeInputSchema),z.lazy(() => JobTimingsCreateInputSchema) ]).optional().nullable(),
  disabled: z.boolean().optional(),
  startMessage: z.string().optional().nullable()
}).strict();

export const BotUpdateManyMutationInputSchema: z.ZodType<Prisma.BotUpdateManyMutationInput> = z.object({
  identifier: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  accessControl: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  accessControlMessage: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  userHistoryTime: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  gptLanguageDetector: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  hasAttendance: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  attendanceOnGreeting: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  directAttendance: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  tokenLimit: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  totalTokens: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  textSearch: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  trainingInfo: z.union([ z.lazy(() => TrainingInfoNullableUpdateEnvelopeInputSchema),z.lazy(() => TrainingInfoCreateInputSchema) ]).optional().nullable(),
  openaiConfig: z.union([ z.lazy(() => OpenAIConfigNullableUpdateEnvelopeInputSchema),z.lazy(() => OpenAIConfigCreateInputSchema) ]).optional().nullable(),
  jobTimings: z.union([ z.lazy(() => JobTimingsNullableUpdateEnvelopeInputSchema),z.lazy(() => JobTimingsCreateInputSchema) ]).optional().nullable(),
  disabled: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  startMessage: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const BotUncheckedUpdateManyInputSchema: z.ZodType<Prisma.BotUncheckedUpdateManyInput> = z.object({
  identifier: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  accessControl: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  accessControlMessage: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  userHistoryTime: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  gptLanguageDetector: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  hasAttendance: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  attendanceOnGreeting: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  directAttendance: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  tokenLimit: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  totalTokens: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  textSearch: z.union([ z.boolean(),z.lazy(() => NullableBoolFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  trainingInfo: z.union([ z.lazy(() => TrainingInfoNullableUpdateEnvelopeInputSchema),z.lazy(() => TrainingInfoCreateInputSchema) ]).optional().nullable(),
  openaiConfig: z.union([ z.lazy(() => OpenAIConfigNullableUpdateEnvelopeInputSchema),z.lazy(() => OpenAIConfigCreateInputSchema) ]).optional().nullable(),
  jobTimings: z.union([ z.lazy(() => JobTimingsNullableUpdateEnvelopeInputSchema),z.lazy(() => JobTimingsCreateInputSchema) ]).optional().nullable(),
  disabled: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  startMessage: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
}).strict();

export const MessageCreateInputSchema: z.ZodType<Prisma.MessageCreateInput> = z.object({
  id: z.string().optional(),
  botId: z.string(),
  message: z.string(),
  userId: z.string(),
  isResponse: z.boolean(),
  response: z.string(),
  timestamp: z.coerce.date().optional(),
  flags: InputJsonValue.optional()
}).strict();

export const MessageUncheckedCreateInputSchema: z.ZodType<Prisma.MessageUncheckedCreateInput> = z.object({
  id: z.string().optional(),
  botId: z.string(),
  message: z.string(),
  userId: z.string(),
  isResponse: z.boolean(),
  response: z.string(),
  timestamp: z.coerce.date().optional(),
  flags: InputJsonValue.optional()
}).strict();

export const MessageUpdateInputSchema: z.ZodType<Prisma.MessageUpdateInput> = z.object({
  botId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  message: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isResponse: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  response: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  flags: z.union([ InputJsonValue,InputJsonValue ]).optional(),
}).strict();

export const MessageUncheckedUpdateInputSchema: z.ZodType<Prisma.MessageUncheckedUpdateInput> = z.object({
  botId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  message: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isResponse: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  response: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  flags: z.union([ InputJsonValue,InputJsonValue ]).optional(),
}).strict();

export const MessageCreateManyInputSchema: z.ZodType<Prisma.MessageCreateManyInput> = z.object({
  id: z.string().optional(),
  botId: z.string(),
  message: z.string(),
  userId: z.string(),
  isResponse: z.boolean(),
  response: z.string(),
  timestamp: z.coerce.date().optional(),
  flags: InputJsonValue.optional()
}).strict();

export const MessageUpdateManyMutationInputSchema: z.ZodType<Prisma.MessageUpdateManyMutationInput> = z.object({
  botId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  message: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isResponse: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  response: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  flags: z.union([ InputJsonValue,InputJsonValue ]).optional(),
}).strict();

export const MessageUncheckedUpdateManyInputSchema: z.ZodType<Prisma.MessageUncheckedUpdateManyInput> = z.object({
  botId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  message: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  userId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  isResponse: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  response: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  flags: z.union([ InputJsonValue,InputJsonValue ]).optional(),
}).strict();

export const ChatGPTCallCreateInputSchema: z.ZodType<Prisma.ChatGPTCallCreateInput> = z.object({
  id: z.string().optional(),
  botId: z.string(),
  promptTokens: z.number().int(),
  responseTokens: z.number().int(),
  totalTokens: z.number().int(),
  apiKeyHint: z.string(),
  model: z.string(),
  timestamp: z.coerce.date().optional(),
  latency: z.number().int()
}).strict();

export const ChatGPTCallUncheckedCreateInputSchema: z.ZodType<Prisma.ChatGPTCallUncheckedCreateInput> = z.object({
  id: z.string().optional(),
  botId: z.string(),
  promptTokens: z.number().int(),
  responseTokens: z.number().int(),
  totalTokens: z.number().int(),
  apiKeyHint: z.string(),
  model: z.string(),
  timestamp: z.coerce.date().optional(),
  latency: z.number().int()
}).strict();

export const ChatGPTCallUpdateInputSchema: z.ZodType<Prisma.ChatGPTCallUpdateInput> = z.object({
  botId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  promptTokens: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  responseTokens: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  totalTokens: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  apiKeyHint: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  model: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  latency: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ChatGPTCallUncheckedUpdateInputSchema: z.ZodType<Prisma.ChatGPTCallUncheckedUpdateInput> = z.object({
  botId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  promptTokens: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  responseTokens: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  totalTokens: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  apiKeyHint: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  model: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  latency: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ChatGPTCallCreateManyInputSchema: z.ZodType<Prisma.ChatGPTCallCreateManyInput> = z.object({
  id: z.string().optional(),
  botId: z.string(),
  promptTokens: z.number().int(),
  responseTokens: z.number().int(),
  totalTokens: z.number().int(),
  apiKeyHint: z.string(),
  model: z.string(),
  timestamp: z.coerce.date().optional(),
  latency: z.number().int()
}).strict();

export const ChatGPTCallUpdateManyMutationInputSchema: z.ZodType<Prisma.ChatGPTCallUpdateManyMutationInput> = z.object({
  botId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  promptTokens: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  responseTokens: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  totalTokens: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  apiKeyHint: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  model: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  latency: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ChatGPTCallUncheckedUpdateManyInputSchema: z.ZodType<Prisma.ChatGPTCallUncheckedUpdateManyInput> = z.object({
  botId: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  promptTokens: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  responseTokens: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  totalTokens: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  apiKeyHint: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  model: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  latency: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const StringFilterSchema: z.ZodType<Prisma.StringFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringFilterSchema) ]).optional(),
}).strict();

export const BoolFilterSchema: z.ZodType<Prisma.BoolFilter> = z.object({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolFilterSchema) ]).optional(),
}).strict();

export const StringNullableFilterSchema: z.ZodType<Prisma.StringNullableFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableFilterSchema) ]).optional().nullable(),
  isSet: z.boolean().optional()
}).strict();

export const IntFilterSchema: z.ZodType<Prisma.IntFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntFilterSchema) ]).optional(),
}).strict();

export const DateTimeFilterSchema: z.ZodType<Prisma.DateTimeFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeFilterSchema) ]).optional(),
}).strict();

export const BoolNullableFilterSchema: z.ZodType<Prisma.BoolNullableFilter> = z.object({
  equals: z.boolean().optional().nullable(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolNullableFilterSchema) ]).optional().nullable(),
  isSet: z.boolean().optional()
}).strict();

export const TrainingInfoNullableCompositeFilterSchema: z.ZodType<Prisma.TrainingInfoNullableCompositeFilter> = z.object({
  equals: z.lazy(() => TrainingInfoObjectEqualityInputSchema).optional().nullable(),
  is: z.lazy(() => TrainingInfoWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => TrainingInfoWhereInputSchema).optional().nullable(),
  isSet: z.boolean().optional()
}).strict();

export const TrainingInfoObjectEqualityInputSchema: z.ZodType<Prisma.TrainingInfoObjectEqualityInput> = z.object({
  status: z.lazy(() => TrainingStatusSchema),
  errorMessages: z.string().array().optional(),
  dataJson: z.string(),
  duration: z.number(),
  timestamp: z.coerce.date()
}).strict();

export const OpenAIConfigNullableCompositeFilterSchema: z.ZodType<Prisma.OpenAIConfigNullableCompositeFilter> = z.object({
  equals: z.lazy(() => OpenAIConfigObjectEqualityInputSchema).optional().nullable(),
  is: z.lazy(() => OpenAIConfigWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => OpenAIConfigWhereInputSchema).optional().nullable(),
  isSet: z.boolean().optional()
}).strict();

export const OpenAIConfigObjectEqualityInputSchema: z.ZodType<Prisma.OpenAIConfigObjectEqualityInput> = z.object({
  temperature: z.number().optional().nullable(),
  messageBuffer: z.number(),
  openaiKey: z.string(),
  llmModel: z.string(),
  tempContent: z.lazy(() => ChatGPTPromptContentObjectEqualityInputSchema)
}).strict();

export const JobTimingsNullableCompositeFilterSchema: z.ZodType<Prisma.JobTimingsNullableCompositeFilter> = z.object({
  equals: z.lazy(() => JobTimingsObjectEqualityInputSchema).optional().nullable(),
  is: z.lazy(() => JobTimingsWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => JobTimingsWhereInputSchema).optional().nullable(),
  isSet: z.boolean().optional()
}).strict();

export const JobTimingsObjectEqualityInputSchema: z.ZodType<Prisma.JobTimingsObjectEqualityInput> = z.object({
  defaultJobMinutes: z.number()
}).strict();

export const TrainingInfoOrderByInputSchema: z.ZodType<Prisma.TrainingInfoOrderByInput> = z.object({
  status: z.lazy(() => SortOrderSchema).optional(),
  errorMessages: z.lazy(() => SortOrderSchema).optional(),
  dataJson: z.lazy(() => SortOrderSchema).optional(),
  duration: z.lazy(() => SortOrderSchema).optional(),
  timestamp: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const OpenAIConfigOrderByInputSchema: z.ZodType<Prisma.OpenAIConfigOrderByInput> = z.object({
  temperature: z.lazy(() => SortOrderSchema).optional(),
  messageBuffer: z.lazy(() => SortOrderSchema).optional(),
  openaiKey: z.lazy(() => SortOrderSchema).optional(),
  llmModel: z.lazy(() => SortOrderSchema).optional(),
  tempContent: z.lazy(() => ChatGPTPromptContentOrderByInputSchema).optional()
}).strict();

export const JobTimingsOrderByInputSchema: z.ZodType<Prisma.JobTimingsOrderByInput> = z.object({
  defaultJobMinutes: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const BotCountOrderByAggregateInputSchema: z.ZodType<Prisma.BotCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  identifier: z.lazy(() => SortOrderSchema).optional(),
  accessControl: z.lazy(() => SortOrderSchema).optional(),
  accessControlMessage: z.lazy(() => SortOrderSchema).optional(),
  userHistoryTime: z.lazy(() => SortOrderSchema).optional(),
  gptLanguageDetector: z.lazy(() => SortOrderSchema).optional(),
  hasAttendance: z.lazy(() => SortOrderSchema).optional(),
  attendanceOnGreeting: z.lazy(() => SortOrderSchema).optional(),
  directAttendance: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  timestamp: z.lazy(() => SortOrderSchema).optional(),
  tokenLimit: z.lazy(() => SortOrderSchema).optional(),
  totalTokens: z.lazy(() => SortOrderSchema).optional(),
  textSearch: z.lazy(() => SortOrderSchema).optional(),
  disabled: z.lazy(() => SortOrderSchema).optional(),
  startMessage: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const BotAvgOrderByAggregateInputSchema: z.ZodType<Prisma.BotAvgOrderByAggregateInput> = z.object({
  userHistoryTime: z.lazy(() => SortOrderSchema).optional(),
  tokenLimit: z.lazy(() => SortOrderSchema).optional(),
  totalTokens: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const BotMaxOrderByAggregateInputSchema: z.ZodType<Prisma.BotMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  identifier: z.lazy(() => SortOrderSchema).optional(),
  accessControl: z.lazy(() => SortOrderSchema).optional(),
  accessControlMessage: z.lazy(() => SortOrderSchema).optional(),
  userHistoryTime: z.lazy(() => SortOrderSchema).optional(),
  gptLanguageDetector: z.lazy(() => SortOrderSchema).optional(),
  hasAttendance: z.lazy(() => SortOrderSchema).optional(),
  attendanceOnGreeting: z.lazy(() => SortOrderSchema).optional(),
  directAttendance: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  timestamp: z.lazy(() => SortOrderSchema).optional(),
  tokenLimit: z.lazy(() => SortOrderSchema).optional(),
  totalTokens: z.lazy(() => SortOrderSchema).optional(),
  textSearch: z.lazy(() => SortOrderSchema).optional(),
  disabled: z.lazy(() => SortOrderSchema).optional(),
  startMessage: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const BotMinOrderByAggregateInputSchema: z.ZodType<Prisma.BotMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  identifier: z.lazy(() => SortOrderSchema).optional(),
  accessControl: z.lazy(() => SortOrderSchema).optional(),
  accessControlMessage: z.lazy(() => SortOrderSchema).optional(),
  userHistoryTime: z.lazy(() => SortOrderSchema).optional(),
  gptLanguageDetector: z.lazy(() => SortOrderSchema).optional(),
  hasAttendance: z.lazy(() => SortOrderSchema).optional(),
  attendanceOnGreeting: z.lazy(() => SortOrderSchema).optional(),
  directAttendance: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  timestamp: z.lazy(() => SortOrderSchema).optional(),
  tokenLimit: z.lazy(() => SortOrderSchema).optional(),
  totalTokens: z.lazy(() => SortOrderSchema).optional(),
  textSearch: z.lazy(() => SortOrderSchema).optional(),
  disabled: z.lazy(() => SortOrderSchema).optional(),
  startMessage: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const BotSumOrderByAggregateInputSchema: z.ZodType<Prisma.BotSumOrderByAggregateInput> = z.object({
  userHistoryTime: z.lazy(() => SortOrderSchema).optional(),
  tokenLimit: z.lazy(() => SortOrderSchema).optional(),
  totalTokens: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const StringWithAggregatesFilterSchema: z.ZodType<Prisma.StringWithAggregatesFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedStringFilterSchema).optional(),
  _max: z.lazy(() => NestedStringFilterSchema).optional()
}).strict();

export const BoolWithAggregatesFilterSchema: z.ZodType<Prisma.BoolWithAggregatesFilter> = z.object({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedBoolFilterSchema).optional(),
  _max: z.lazy(() => NestedBoolFilterSchema).optional()
}).strict();

export const StringNullableWithAggregatesFilterSchema: z.ZodType<Prisma.StringNullableWithAggregatesFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedStringNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedStringNullableFilterSchema).optional(),
  isSet: z.boolean().optional()
}).strict();

export const IntWithAggregatesFilterSchema: z.ZodType<Prisma.IntWithAggregatesFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedIntFilterSchema).optional(),
  _max: z.lazy(() => NestedIntFilterSchema).optional()
}).strict();

export const DateTimeWithAggregatesFilterSchema: z.ZodType<Prisma.DateTimeWithAggregatesFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeFilterSchema).optional()
}).strict();

export const BoolNullableWithAggregatesFilterSchema: z.ZodType<Prisma.BoolNullableWithAggregatesFilter> = z.object({
  equals: z.boolean().optional().nullable(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedBoolNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedBoolNullableFilterSchema).optional(),
  isSet: z.boolean().optional()
}).strict();

export const JsonFilterSchema: z.ZodType<Prisma.JsonFilter> = z.object({
  equals: InputJsonValue.optional(),
  not: InputJsonValue.optional()
}).strict();

export const MessageCountOrderByAggregateInputSchema: z.ZodType<Prisma.MessageCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  botId: z.lazy(() => SortOrderSchema).optional(),
  message: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  isResponse: z.lazy(() => SortOrderSchema).optional(),
  response: z.lazy(() => SortOrderSchema).optional(),
  timestamp: z.lazy(() => SortOrderSchema).optional(),
  flags: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const MessageMaxOrderByAggregateInputSchema: z.ZodType<Prisma.MessageMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  botId: z.lazy(() => SortOrderSchema).optional(),
  message: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  isResponse: z.lazy(() => SortOrderSchema).optional(),
  response: z.lazy(() => SortOrderSchema).optional(),
  timestamp: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const MessageMinOrderByAggregateInputSchema: z.ZodType<Prisma.MessageMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  botId: z.lazy(() => SortOrderSchema).optional(),
  message: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  isResponse: z.lazy(() => SortOrderSchema).optional(),
  response: z.lazy(() => SortOrderSchema).optional(),
  timestamp: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const JsonWithAggregatesFilterSchema: z.ZodType<Prisma.JsonWithAggregatesFilter> = z.object({
  equals: InputJsonValue.optional(),
  not: InputJsonValue.optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedJsonFilterSchema).optional(),
  _max: z.lazy(() => NestedJsonFilterSchema).optional()
}).strict();

export const ChatGPTCallCountOrderByAggregateInputSchema: z.ZodType<Prisma.ChatGPTCallCountOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  botId: z.lazy(() => SortOrderSchema).optional(),
  promptTokens: z.lazy(() => SortOrderSchema).optional(),
  responseTokens: z.lazy(() => SortOrderSchema).optional(),
  totalTokens: z.lazy(() => SortOrderSchema).optional(),
  apiKeyHint: z.lazy(() => SortOrderSchema).optional(),
  model: z.lazy(() => SortOrderSchema).optional(),
  timestamp: z.lazy(() => SortOrderSchema).optional(),
  latency: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ChatGPTCallAvgOrderByAggregateInputSchema: z.ZodType<Prisma.ChatGPTCallAvgOrderByAggregateInput> = z.object({
  promptTokens: z.lazy(() => SortOrderSchema).optional(),
  responseTokens: z.lazy(() => SortOrderSchema).optional(),
  totalTokens: z.lazy(() => SortOrderSchema).optional(),
  latency: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ChatGPTCallMaxOrderByAggregateInputSchema: z.ZodType<Prisma.ChatGPTCallMaxOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  botId: z.lazy(() => SortOrderSchema).optional(),
  promptTokens: z.lazy(() => SortOrderSchema).optional(),
  responseTokens: z.lazy(() => SortOrderSchema).optional(),
  totalTokens: z.lazy(() => SortOrderSchema).optional(),
  apiKeyHint: z.lazy(() => SortOrderSchema).optional(),
  model: z.lazy(() => SortOrderSchema).optional(),
  timestamp: z.lazy(() => SortOrderSchema).optional(),
  latency: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ChatGPTCallMinOrderByAggregateInputSchema: z.ZodType<Prisma.ChatGPTCallMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  botId: z.lazy(() => SortOrderSchema).optional(),
  promptTokens: z.lazy(() => SortOrderSchema).optional(),
  responseTokens: z.lazy(() => SortOrderSchema).optional(),
  totalTokens: z.lazy(() => SortOrderSchema).optional(),
  apiKeyHint: z.lazy(() => SortOrderSchema).optional(),
  model: z.lazy(() => SortOrderSchema).optional(),
  timestamp: z.lazy(() => SortOrderSchema).optional(),
  latency: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ChatGPTCallSumOrderByAggregateInputSchema: z.ZodType<Prisma.ChatGPTCallSumOrderByAggregateInput> = z.object({
  promptTokens: z.lazy(() => SortOrderSchema).optional(),
  responseTokens: z.lazy(() => SortOrderSchema).optional(),
  totalTokens: z.lazy(() => SortOrderSchema).optional(),
  latency: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const TrainingInfoNullableCreateEnvelopeInputSchema: z.ZodType<Prisma.TrainingInfoNullableCreateEnvelopeInput> = z.object({
  set: z.lazy(() => TrainingInfoCreateInputSchema).optional().nullable()
}).strict();

export const TrainingInfoCreateInputSchema: z.ZodType<Prisma.TrainingInfoCreateInput> = z.object({
  status: z.lazy(() => TrainingStatusSchema),
  errorMessages: z.union([ z.lazy(() => TrainingInfoCreateerrorMessagesInputSchema),z.string().array() ]).optional(),
  dataJson: z.string(),
  duration: z.number().optional(),
  timestamp: z.coerce.date().optional()
}).strict();

export const OpenAIConfigNullableCreateEnvelopeInputSchema: z.ZodType<Prisma.OpenAIConfigNullableCreateEnvelopeInput> = z.object({
  set: z.lazy(() => OpenAIConfigCreateInputSchema).optional().nullable()
}).strict();

export const OpenAIConfigCreateInputSchema: z.ZodType<Prisma.OpenAIConfigCreateInput> = z.object({
  temperature: z.number().optional().nullable(),
  messageBuffer: z.number().optional(),
  openaiKey: z.string(),
  llmModel: z.string().optional(),
  tempContent: z.lazy(() => ChatGPTPromptContentCreateInputSchema)
}).strict();

export const JobTimingsNullableCreateEnvelopeInputSchema: z.ZodType<Prisma.JobTimingsNullableCreateEnvelopeInput> = z.object({
  set: z.lazy(() => JobTimingsCreateInputSchema).optional().nullable()
}).strict();

export const JobTimingsCreateInputSchema: z.ZodType<Prisma.JobTimingsCreateInput> = z.object({
  defaultJobMinutes: z.number().optional()
}).strict();

export const StringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.StringFieldUpdateOperationsInput> = z.object({
  set: z.string().optional()
}).strict();

export const BoolFieldUpdateOperationsInputSchema: z.ZodType<Prisma.BoolFieldUpdateOperationsInput> = z.object({
  set: z.boolean().optional()
}).strict();

export const NullableStringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableStringFieldUpdateOperationsInput> = z.object({
  set: z.string().optional().nullable(),
  unset: z.boolean().optional()
}).strict();

export const IntFieldUpdateOperationsInputSchema: z.ZodType<Prisma.IntFieldUpdateOperationsInput> = z.object({
  set: z.number().optional(),
  increment: z.number().optional(),
  decrement: z.number().optional(),
  multiply: z.number().optional(),
  divide: z.number().optional()
}).strict();

export const DateTimeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.DateTimeFieldUpdateOperationsInput> = z.object({
  set: z.coerce.date().optional()
}).strict();

export const NullableBoolFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableBoolFieldUpdateOperationsInput> = z.object({
  set: z.boolean().optional().nullable(),
  unset: z.boolean().optional()
}).strict();

export const TrainingInfoNullableUpdateEnvelopeInputSchema: z.ZodType<Prisma.TrainingInfoNullableUpdateEnvelopeInput> = z.object({
  set: z.lazy(() => TrainingInfoCreateInputSchema).optional().nullable(),
  upsert: z.lazy(() => TrainingInfoUpsertInputSchema).optional(),
  unset: z.boolean().optional()
}).strict();

export const OpenAIConfigNullableUpdateEnvelopeInputSchema: z.ZodType<Prisma.OpenAIConfigNullableUpdateEnvelopeInput> = z.object({
  set: z.lazy(() => OpenAIConfigCreateInputSchema).optional().nullable(),
  upsert: z.lazy(() => OpenAIConfigUpsertInputSchema).optional(),
  unset: z.boolean().optional()
}).strict();

export const JobTimingsNullableUpdateEnvelopeInputSchema: z.ZodType<Prisma.JobTimingsNullableUpdateEnvelopeInput> = z.object({
  set: z.lazy(() => JobTimingsCreateInputSchema).optional().nullable(),
  upsert: z.lazy(() => JobTimingsUpsertInputSchema).optional(),
  unset: z.boolean().optional()
}).strict();

export const NestedStringFilterSchema: z.ZodType<Prisma.NestedStringFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringFilterSchema) ]).optional(),
}).strict();

export const NestedBoolFilterSchema: z.ZodType<Prisma.NestedBoolFilter> = z.object({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolFilterSchema) ]).optional(),
}).strict();

export const NestedStringNullableFilterSchema: z.ZodType<Prisma.NestedStringNullableFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableFilterSchema) ]).optional().nullable(),
  isSet: z.boolean().optional()
}).strict();

export const NestedIntFilterSchema: z.ZodType<Prisma.NestedIntFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntFilterSchema) ]).optional(),
}).strict();

export const NestedDateTimeFilterSchema: z.ZodType<Prisma.NestedDateTimeFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeFilterSchema) ]).optional(),
}).strict();

export const NestedBoolNullableFilterSchema: z.ZodType<Prisma.NestedBoolNullableFilter> = z.object({
  equals: z.boolean().optional().nullable(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolNullableFilterSchema) ]).optional().nullable(),
  isSet: z.boolean().optional()
}).strict();

export const TrainingInfoWhereInputSchema: z.ZodType<Prisma.TrainingInfoWhereInput> = z.object({
  AND: z.union([ z.lazy(() => TrainingInfoWhereInputSchema),z.lazy(() => TrainingInfoWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => TrainingInfoWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => TrainingInfoWhereInputSchema),z.lazy(() => TrainingInfoWhereInputSchema).array() ]).optional(),
  status: z.union([ z.lazy(() => EnumTrainingStatusFilterSchema),z.lazy(() => TrainingStatusSchema) ]).optional(),
  errorMessages: z.lazy(() => StringNullableListFilterSchema).optional(),
  dataJson: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  duration: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  timestamp: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export const OpenAIConfigWhereInputSchema: z.ZodType<Prisma.OpenAIConfigWhereInput> = z.object({
  AND: z.union([ z.lazy(() => OpenAIConfigWhereInputSchema),z.lazy(() => OpenAIConfigWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => OpenAIConfigWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => OpenAIConfigWhereInputSchema),z.lazy(() => OpenAIConfigWhereInputSchema).array() ]).optional(),
  temperature: z.union([ z.lazy(() => FloatNullableFilterSchema),z.number() ]).optional().nullable(),
  messageBuffer: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  openaiKey: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  llmModel: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  tempContent: z.union([ z.lazy(() => ChatGPTPromptContentCompositeFilterSchema),z.lazy(() => ChatGPTPromptContentObjectEqualityInputSchema) ]).optional(),
}).strict();

export const ChatGPTPromptContentObjectEqualityInputSchema: z.ZodType<Prisma.ChatGPTPromptContentObjectEqualityInput> = z.object({
  botName: z.string(),
  sourceText: z.string(),
  sourceUrls: z.string().array().optional(),
  sourceFiles: z.string().array().optional(),
  behavioralRules: z.string().optional().nullable(),
  language: z.lazy(() => ChatGPTLanguageConfigObjectEqualityInputSchema).optional().nullable()
}).strict();

export const JobTimingsWhereInputSchema: z.ZodType<Prisma.JobTimingsWhereInput> = z.object({
  AND: z.union([ z.lazy(() => JobTimingsWhereInputSchema),z.lazy(() => JobTimingsWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => JobTimingsWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => JobTimingsWhereInputSchema),z.lazy(() => JobTimingsWhereInputSchema).array() ]).optional(),
  defaultJobMinutes: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
}).strict();

export const ChatGPTPromptContentOrderByInputSchema: z.ZodType<Prisma.ChatGPTPromptContentOrderByInput> = z.object({
  botName: z.lazy(() => SortOrderSchema).optional(),
  sourceText: z.lazy(() => SortOrderSchema).optional(),
  sourceUrls: z.lazy(() => SortOrderSchema).optional(),
  sourceFiles: z.lazy(() => SortOrderSchema).optional(),
  behavioralRules: z.lazy(() => SortOrderSchema).optional(),
  language: z.lazy(() => ChatGPTLanguageConfigOrderByInputSchema).optional()
}).strict();

export const NestedStringWithAggregatesFilterSchema: z.ZodType<Prisma.NestedStringWithAggregatesFilter> = z.object({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedStringFilterSchema).optional(),
  _max: z.lazy(() => NestedStringFilterSchema).optional()
}).strict();

export const NestedBoolWithAggregatesFilterSchema: z.ZodType<Prisma.NestedBoolWithAggregatesFilter> = z.object({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedBoolFilterSchema).optional(),
  _max: z.lazy(() => NestedBoolFilterSchema).optional()
}).strict();

export const NestedStringNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedStringNullableWithAggregatesFilter> = z.object({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedStringNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedStringNullableFilterSchema).optional(),
  isSet: z.boolean().optional()
}).strict();

export const NestedIntNullableFilterSchema: z.ZodType<Prisma.NestedIntNullableFilter> = z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntNullableFilterSchema) ]).optional().nullable(),
  isSet: z.boolean().optional()
}).strict();

export const NestedIntWithAggregatesFilterSchema: z.ZodType<Prisma.NestedIntWithAggregatesFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedIntFilterSchema).optional(),
  _max: z.lazy(() => NestedIntFilterSchema).optional()
}).strict();

export const NestedFloatFilterSchema: z.ZodType<Prisma.NestedFloatFilter> = z.object({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatFilterSchema) ]).optional(),
}).strict();

export const NestedDateTimeWithAggregatesFilterSchema: z.ZodType<Prisma.NestedDateTimeWithAggregatesFilter> = z.object({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeFilterSchema).optional()
}).strict();

export const NestedBoolNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedBoolNullableWithAggregatesFilter> = z.object({
  equals: z.boolean().optional().nullable(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedBoolNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedBoolNullableFilterSchema).optional(),
  isSet: z.boolean().optional()
}).strict();

export const NestedJsonFilterSchema: z.ZodType<Prisma.NestedJsonFilter> = z.object({
  equals: InputJsonValue.optional(),
  not: InputJsonValue.optional()
}).strict();

export const TrainingInfoCreateerrorMessagesInputSchema: z.ZodType<Prisma.TrainingInfoCreateerrorMessagesInput> = z.object({
  set: z.string().array()
}).strict();

export const ChatGPTPromptContentCreateInputSchema: z.ZodType<Prisma.ChatGPTPromptContentCreateInput> = z.object({
  botName: z.string(),
  sourceText: z.string(),
  sourceUrls: z.union([ z.lazy(() => ChatGPTPromptContentCreatesourceUrlsInputSchema),z.string().array() ]).optional(),
  sourceFiles: z.union([ z.lazy(() => ChatGPTPromptContentCreatesourceFilesInputSchema),z.string().array() ]).optional(),
  behavioralRules: z.string().optional().nullable(),
  language: z.lazy(() => ChatGPTLanguageConfigCreateInputSchema).optional().nullable()
}).strict();

export const TrainingInfoUpsertInputSchema: z.ZodType<Prisma.TrainingInfoUpsertInput> = z.object({
  set: z.lazy(() => TrainingInfoCreateInputSchema).nullable(),
  update: z.lazy(() => TrainingInfoUpdateInputSchema)
}).strict();

export const OpenAIConfigUpsertInputSchema: z.ZodType<Prisma.OpenAIConfigUpsertInput> = z.object({
  set: z.lazy(() => OpenAIConfigCreateInputSchema).nullable(),
  update: z.lazy(() => OpenAIConfigUpdateInputSchema)
}).strict();

export const JobTimingsUpsertInputSchema: z.ZodType<Prisma.JobTimingsUpsertInput> = z.object({
  set: z.lazy(() => JobTimingsCreateInputSchema).nullable(),
  update: z.lazy(() => JobTimingsUpdateInputSchema)
}).strict();

export const EnumTrainingStatusFilterSchema: z.ZodType<Prisma.EnumTrainingStatusFilter> = z.object({
  equals: z.lazy(() => TrainingStatusSchema).optional(),
  in: z.lazy(() => TrainingStatusSchema).array().optional(),
  notIn: z.lazy(() => TrainingStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => TrainingStatusSchema),z.lazy(() => NestedEnumTrainingStatusFilterSchema) ]).optional(),
}).strict();

export const StringNullableListFilterSchema: z.ZodType<Prisma.StringNullableListFilter> = z.object({
  equals: z.string().array().optional().nullable(),
  has: z.string().optional().nullable(),
  hasEvery: z.string().array().optional(),
  hasSome: z.string().array().optional(),
  isEmpty: z.boolean().optional()
}).strict();

export const FloatNullableFilterSchema: z.ZodType<Prisma.FloatNullableFilter> = z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatNullableFilterSchema) ]).optional().nullable(),
  isSet: z.boolean().optional()
}).strict();

export const ChatGPTPromptContentCompositeFilterSchema: z.ZodType<Prisma.ChatGPTPromptContentCompositeFilter> = z.object({
  equals: z.lazy(() => ChatGPTPromptContentObjectEqualityInputSchema).optional(),
  is: z.lazy(() => ChatGPTPromptContentWhereInputSchema).optional(),
  isNot: z.lazy(() => ChatGPTPromptContentWhereInputSchema).optional()
}).strict();

export const ChatGPTLanguageConfigObjectEqualityInputSchema: z.ZodType<Prisma.ChatGPTLanguageConfigObjectEqualityInput> = z.object({
  allowedLanguages: z.string().array().optional(),
  defaultLanguage: z.string()
}).strict();

export const ChatGPTLanguageConfigOrderByInputSchema: z.ZodType<Prisma.ChatGPTLanguageConfigOrderByInput> = z.object({
  allowedLanguages: z.lazy(() => SortOrderSchema).optional(),
  defaultLanguage: z.lazy(() => SortOrderSchema).optional()
}).strict();

export const ChatGPTPromptContentCreatesourceUrlsInputSchema: z.ZodType<Prisma.ChatGPTPromptContentCreatesourceUrlsInput> = z.object({
  set: z.string().array()
}).strict();

export const ChatGPTPromptContentCreatesourceFilesInputSchema: z.ZodType<Prisma.ChatGPTPromptContentCreatesourceFilesInput> = z.object({
  set: z.string().array()
}).strict();

export const ChatGPTLanguageConfigCreateInputSchema: z.ZodType<Prisma.ChatGPTLanguageConfigCreateInput> = z.object({
  allowedLanguages: z.union([ z.lazy(() => ChatGPTLanguageConfigCreateallowedLanguagesInputSchema),z.string().array() ]).optional(),
  defaultLanguage: z.string()
}).strict();

export const TrainingInfoUpdateInputSchema: z.ZodType<Prisma.TrainingInfoUpdateInput> = z.object({
  status: z.union([ z.lazy(() => TrainingStatusSchema),z.lazy(() => EnumTrainingStatusFieldUpdateOperationsInputSchema) ]).optional(),
  errorMessages: z.union([ z.lazy(() => TrainingInfoUpdateerrorMessagesInputSchema),z.string().array() ]).optional(),
  dataJson: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  duration: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  timestamp: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const OpenAIConfigUpdateInputSchema: z.ZodType<Prisma.OpenAIConfigUpdateInput> = z.object({
  temperature: z.union([ z.number(),z.lazy(() => NullableFloatFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  messageBuffer: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  openaiKey: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  llmModel: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  tempContent: z.union([ z.lazy(() => ChatGPTPromptContentUpdateEnvelopeInputSchema),z.lazy(() => ChatGPTPromptContentCreateInputSchema) ]).optional(),
}).strict();

export const JobTimingsUpdateInputSchema: z.ZodType<Prisma.JobTimingsUpdateInput> = z.object({
  defaultJobMinutes: z.union([ z.number(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const NestedEnumTrainingStatusFilterSchema: z.ZodType<Prisma.NestedEnumTrainingStatusFilter> = z.object({
  equals: z.lazy(() => TrainingStatusSchema).optional(),
  in: z.lazy(() => TrainingStatusSchema).array().optional(),
  notIn: z.lazy(() => TrainingStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => TrainingStatusSchema),z.lazy(() => NestedEnumTrainingStatusFilterSchema) ]).optional(),
}).strict();

export const NestedFloatNullableFilterSchema: z.ZodType<Prisma.NestedFloatNullableFilter> = z.object({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatNullableFilterSchema) ]).optional().nullable(),
  isSet: z.boolean().optional()
}).strict();

export const ChatGPTPromptContentWhereInputSchema: z.ZodType<Prisma.ChatGPTPromptContentWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ChatGPTPromptContentWhereInputSchema),z.lazy(() => ChatGPTPromptContentWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ChatGPTPromptContentWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ChatGPTPromptContentWhereInputSchema),z.lazy(() => ChatGPTPromptContentWhereInputSchema).array() ]).optional(),
  botName: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  sourceText: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  sourceUrls: z.lazy(() => StringNullableListFilterSchema).optional(),
  sourceFiles: z.lazy(() => StringNullableListFilterSchema).optional(),
  behavioralRules: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  language: z.union([ z.lazy(() => ChatGPTLanguageConfigNullableCompositeFilterSchema),z.lazy(() => ChatGPTLanguageConfigObjectEqualityInputSchema) ]).optional().nullable(),
}).strict();

export const ChatGPTLanguageConfigCreateallowedLanguagesInputSchema: z.ZodType<Prisma.ChatGPTLanguageConfigCreateallowedLanguagesInput> = z.object({
  set: z.string().array()
}).strict();

export const EnumTrainingStatusFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumTrainingStatusFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => TrainingStatusSchema).optional()
}).strict();

export const TrainingInfoUpdateerrorMessagesInputSchema: z.ZodType<Prisma.TrainingInfoUpdateerrorMessagesInput> = z.object({
  set: z.string().array().optional(),
  push: z.union([ z.string(),z.string().array() ]).optional(),
}).strict();

export const NullableFloatFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableFloatFieldUpdateOperationsInput> = z.object({
  set: z.number().optional().nullable(),
  increment: z.number().optional(),
  decrement: z.number().optional(),
  multiply: z.number().optional(),
  divide: z.number().optional(),
  unset: z.boolean().optional()
}).strict();

export const ChatGPTPromptContentUpdateEnvelopeInputSchema: z.ZodType<Prisma.ChatGPTPromptContentUpdateEnvelopeInput> = z.object({
  set: z.lazy(() => ChatGPTPromptContentCreateInputSchema).optional(),
  update: z.lazy(() => ChatGPTPromptContentUpdateInputSchema).optional()
}).strict();

export const ChatGPTLanguageConfigNullableCompositeFilterSchema: z.ZodType<Prisma.ChatGPTLanguageConfigNullableCompositeFilter> = z.object({
  equals: z.lazy(() => ChatGPTLanguageConfigObjectEqualityInputSchema).optional().nullable(),
  is: z.lazy(() => ChatGPTLanguageConfigWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => ChatGPTLanguageConfigWhereInputSchema).optional().nullable(),
  isSet: z.boolean().optional()
}).strict();

export const ChatGPTPromptContentUpdateInputSchema: z.ZodType<Prisma.ChatGPTPromptContentUpdateInput> = z.object({
  botName: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  sourceText: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  sourceUrls: z.union([ z.lazy(() => ChatGPTPromptContentUpdatesourceUrlsInputSchema),z.string().array() ]).optional(),
  sourceFiles: z.union([ z.lazy(() => ChatGPTPromptContentUpdatesourceFilesInputSchema),z.string().array() ]).optional(),
  behavioralRules: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  language: z.union([ z.lazy(() => ChatGPTLanguageConfigNullableUpdateEnvelopeInputSchema),z.lazy(() => ChatGPTLanguageConfigCreateInputSchema) ]).optional().nullable(),
}).strict();

export const ChatGPTLanguageConfigWhereInputSchema: z.ZodType<Prisma.ChatGPTLanguageConfigWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ChatGPTLanguageConfigWhereInputSchema),z.lazy(() => ChatGPTLanguageConfigWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ChatGPTLanguageConfigWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ChatGPTLanguageConfigWhereInputSchema),z.lazy(() => ChatGPTLanguageConfigWhereInputSchema).array() ]).optional(),
  allowedLanguages: z.lazy(() => StringNullableListFilterSchema).optional(),
  defaultLanguage: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
}).strict();

export const ChatGPTPromptContentUpdatesourceUrlsInputSchema: z.ZodType<Prisma.ChatGPTPromptContentUpdatesourceUrlsInput> = z.object({
  set: z.string().array().optional(),
  push: z.union([ z.string(),z.string().array() ]).optional(),
}).strict();

export const ChatGPTPromptContentUpdatesourceFilesInputSchema: z.ZodType<Prisma.ChatGPTPromptContentUpdatesourceFilesInput> = z.object({
  set: z.string().array().optional(),
  push: z.union([ z.string(),z.string().array() ]).optional(),
}).strict();

export const ChatGPTLanguageConfigNullableUpdateEnvelopeInputSchema: z.ZodType<Prisma.ChatGPTLanguageConfigNullableUpdateEnvelopeInput> = z.object({
  set: z.lazy(() => ChatGPTLanguageConfigCreateInputSchema).optional().nullable(),
  upsert: z.lazy(() => ChatGPTLanguageConfigUpsertInputSchema).optional(),
  unset: z.boolean().optional()
}).strict();

export const ChatGPTLanguageConfigUpsertInputSchema: z.ZodType<Prisma.ChatGPTLanguageConfigUpsertInput> = z.object({
  set: z.lazy(() => ChatGPTLanguageConfigCreateInputSchema).nullable(),
  update: z.lazy(() => ChatGPTLanguageConfigUpdateInputSchema)
}).strict();

export const ChatGPTLanguageConfigUpdateInputSchema: z.ZodType<Prisma.ChatGPTLanguageConfigUpdateInput> = z.object({
  allowedLanguages: z.union([ z.lazy(() => ChatGPTLanguageConfigUpdateallowedLanguagesInputSchema),z.string().array() ]).optional(),
  defaultLanguage: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
}).strict();

export const ChatGPTLanguageConfigUpdateallowedLanguagesInputSchema: z.ZodType<Prisma.ChatGPTLanguageConfigUpdateallowedLanguagesInput> = z.object({
  set: z.string().array().optional(),
  push: z.union([ z.string(),z.string().array() ]).optional(),
}).strict();

/////////////////////////////////////////
// ARGS
/////////////////////////////////////////

export const BotFindFirstArgsSchema: z.ZodType<Prisma.BotFindFirstArgs> = z.object({
  select: BotSelectSchema.optional(),
  include: BotIncludeSchema.optional(),
  where: BotWhereInputSchema.optional(),
  orderBy: z.union([ BotOrderByWithRelationInputSchema.array(),BotOrderByWithRelationInputSchema ]).optional(),
  cursor: BotWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ BotScalarFieldEnumSchema,BotScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const BotFindFirstOrThrowArgsSchema: z.ZodType<Prisma.BotFindFirstOrThrowArgs> = z.object({
  select: BotSelectSchema.optional(),
  include: BotIncludeSchema.optional(),
  where: BotWhereInputSchema.optional(),
  orderBy: z.union([ BotOrderByWithRelationInputSchema.array(),BotOrderByWithRelationInputSchema ]).optional(),
  cursor: BotWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ BotScalarFieldEnumSchema,BotScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const BotFindManyArgsSchema: z.ZodType<Prisma.BotFindManyArgs> = z.object({
  select: BotSelectSchema.optional(),
  include: BotIncludeSchema.optional(),
  where: BotWhereInputSchema.optional(),
  orderBy: z.union([ BotOrderByWithRelationInputSchema.array(),BotOrderByWithRelationInputSchema ]).optional(),
  cursor: BotWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ BotScalarFieldEnumSchema,BotScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const BotAggregateArgsSchema: z.ZodType<Prisma.BotAggregateArgs> = z.object({
  where: BotWhereInputSchema.optional(),
  orderBy: z.union([ BotOrderByWithRelationInputSchema.array(),BotOrderByWithRelationInputSchema ]).optional(),
  cursor: BotWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const BotGroupByArgsSchema: z.ZodType<Prisma.BotGroupByArgs> = z.object({
  where: BotWhereInputSchema.optional(),
  orderBy: z.union([ BotOrderByWithAggregationInputSchema.array(),BotOrderByWithAggregationInputSchema ]).optional(),
  by: BotScalarFieldEnumSchema.array(),
  having: BotScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const BotFindUniqueArgsSchema: z.ZodType<Prisma.BotFindUniqueArgs> = z.object({
  select: BotSelectSchema.optional(),
  include: BotIncludeSchema.optional(),
  where: BotWhereUniqueInputSchema,
}).strict()

export const BotFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.BotFindUniqueOrThrowArgs> = z.object({
  select: BotSelectSchema.optional(),
  include: BotIncludeSchema.optional(),
  where: BotWhereUniqueInputSchema,
}).strict()

export const MessageFindFirstArgsSchema: z.ZodType<Prisma.MessageFindFirstArgs> = z.object({
  select: MessageSelectSchema.optional(),
  where: MessageWhereInputSchema.optional(),
  orderBy: z.union([ MessageOrderByWithRelationInputSchema.array(),MessageOrderByWithRelationInputSchema ]).optional(),
  cursor: MessageWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ MessageScalarFieldEnumSchema,MessageScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const MessageFindFirstOrThrowArgsSchema: z.ZodType<Prisma.MessageFindFirstOrThrowArgs> = z.object({
  select: MessageSelectSchema.optional(),
  where: MessageWhereInputSchema.optional(),
  orderBy: z.union([ MessageOrderByWithRelationInputSchema.array(),MessageOrderByWithRelationInputSchema ]).optional(),
  cursor: MessageWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ MessageScalarFieldEnumSchema,MessageScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const MessageFindManyArgsSchema: z.ZodType<Prisma.MessageFindManyArgs> = z.object({
  select: MessageSelectSchema.optional(),
  where: MessageWhereInputSchema.optional(),
  orderBy: z.union([ MessageOrderByWithRelationInputSchema.array(),MessageOrderByWithRelationInputSchema ]).optional(),
  cursor: MessageWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ MessageScalarFieldEnumSchema,MessageScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const MessageAggregateArgsSchema: z.ZodType<Prisma.MessageAggregateArgs> = z.object({
  where: MessageWhereInputSchema.optional(),
  orderBy: z.union([ MessageOrderByWithRelationInputSchema.array(),MessageOrderByWithRelationInputSchema ]).optional(),
  cursor: MessageWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const MessageGroupByArgsSchema: z.ZodType<Prisma.MessageGroupByArgs> = z.object({
  where: MessageWhereInputSchema.optional(),
  orderBy: z.union([ MessageOrderByWithAggregationInputSchema.array(),MessageOrderByWithAggregationInputSchema ]).optional(),
  by: MessageScalarFieldEnumSchema.array(),
  having: MessageScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const MessageFindUniqueArgsSchema: z.ZodType<Prisma.MessageFindUniqueArgs> = z.object({
  select: MessageSelectSchema.optional(),
  where: MessageWhereUniqueInputSchema,
}).strict()

export const MessageFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.MessageFindUniqueOrThrowArgs> = z.object({
  select: MessageSelectSchema.optional(),
  where: MessageWhereUniqueInputSchema,
}).strict()

export const ChatGPTCallFindFirstArgsSchema: z.ZodType<Prisma.ChatGPTCallFindFirstArgs> = z.object({
  select: ChatGPTCallSelectSchema.optional(),
  where: ChatGPTCallWhereInputSchema.optional(),
  orderBy: z.union([ ChatGPTCallOrderByWithRelationInputSchema.array(),ChatGPTCallOrderByWithRelationInputSchema ]).optional(),
  cursor: ChatGPTCallWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ChatGPTCallScalarFieldEnumSchema,ChatGPTCallScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const ChatGPTCallFindFirstOrThrowArgsSchema: z.ZodType<Prisma.ChatGPTCallFindFirstOrThrowArgs> = z.object({
  select: ChatGPTCallSelectSchema.optional(),
  where: ChatGPTCallWhereInputSchema.optional(),
  orderBy: z.union([ ChatGPTCallOrderByWithRelationInputSchema.array(),ChatGPTCallOrderByWithRelationInputSchema ]).optional(),
  cursor: ChatGPTCallWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ChatGPTCallScalarFieldEnumSchema,ChatGPTCallScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const ChatGPTCallFindManyArgsSchema: z.ZodType<Prisma.ChatGPTCallFindManyArgs> = z.object({
  select: ChatGPTCallSelectSchema.optional(),
  where: ChatGPTCallWhereInputSchema.optional(),
  orderBy: z.union([ ChatGPTCallOrderByWithRelationInputSchema.array(),ChatGPTCallOrderByWithRelationInputSchema ]).optional(),
  cursor: ChatGPTCallWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ChatGPTCallScalarFieldEnumSchema,ChatGPTCallScalarFieldEnumSchema.array() ]).optional(),
}).strict()

export const ChatGPTCallAggregateArgsSchema: z.ZodType<Prisma.ChatGPTCallAggregateArgs> = z.object({
  where: ChatGPTCallWhereInputSchema.optional(),
  orderBy: z.union([ ChatGPTCallOrderByWithRelationInputSchema.array(),ChatGPTCallOrderByWithRelationInputSchema ]).optional(),
  cursor: ChatGPTCallWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const ChatGPTCallGroupByArgsSchema: z.ZodType<Prisma.ChatGPTCallGroupByArgs> = z.object({
  where: ChatGPTCallWhereInputSchema.optional(),
  orderBy: z.union([ ChatGPTCallOrderByWithAggregationInputSchema.array(),ChatGPTCallOrderByWithAggregationInputSchema ]).optional(),
  by: ChatGPTCallScalarFieldEnumSchema.array(),
  having: ChatGPTCallScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict()

export const ChatGPTCallFindUniqueArgsSchema: z.ZodType<Prisma.ChatGPTCallFindUniqueArgs> = z.object({
  select: ChatGPTCallSelectSchema.optional(),
  where: ChatGPTCallWhereUniqueInputSchema,
}).strict()

export const ChatGPTCallFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.ChatGPTCallFindUniqueOrThrowArgs> = z.object({
  select: ChatGPTCallSelectSchema.optional(),
  where: ChatGPTCallWhereUniqueInputSchema,
}).strict()

export const BotCreateArgsSchema: z.ZodType<Prisma.BotCreateArgs> = z.object({
  select: BotSelectSchema.optional(),
  include: BotIncludeSchema.optional(),
  data: z.union([ BotCreateInputSchema,BotUncheckedCreateInputSchema ]),
}).strict()

export const BotUpsertArgsSchema: z.ZodType<Prisma.BotUpsertArgs> = z.object({
  select: BotSelectSchema.optional(),
  include: BotIncludeSchema.optional(),
  where: BotWhereUniqueInputSchema,
  create: z.union([ BotCreateInputSchema,BotUncheckedCreateInputSchema ]),
  update: z.union([ BotUpdateInputSchema,BotUncheckedUpdateInputSchema ]),
}).strict()

export const BotCreateManyArgsSchema: z.ZodType<Prisma.BotCreateManyArgs> = z.object({
  data: z.union([ BotCreateManyInputSchema,BotCreateManyInputSchema.array() ]),
}).strict()

export const BotDeleteArgsSchema: z.ZodType<Prisma.BotDeleteArgs> = z.object({
  select: BotSelectSchema.optional(),
  include: BotIncludeSchema.optional(),
  where: BotWhereUniqueInputSchema,
}).strict()

export const BotUpdateArgsSchema: z.ZodType<Prisma.BotUpdateArgs> = z.object({
  select: BotSelectSchema.optional(),
  include: BotIncludeSchema.optional(),
  data: z.union([ BotUpdateInputSchema,BotUncheckedUpdateInputSchema ]),
  where: BotWhereUniqueInputSchema,
}).strict()

export const BotUpdateManyArgsSchema: z.ZodType<Prisma.BotUpdateManyArgs> = z.object({
  data: z.union([ BotUpdateManyMutationInputSchema,BotUncheckedUpdateManyInputSchema ]),
  where: BotWhereInputSchema.optional(),
}).strict()

export const BotDeleteManyArgsSchema: z.ZodType<Prisma.BotDeleteManyArgs> = z.object({
  where: BotWhereInputSchema.optional(),
}).strict()

export const MessageCreateArgsSchema: z.ZodType<Prisma.MessageCreateArgs> = z.object({
  select: MessageSelectSchema.optional(),
  data: z.union([ MessageCreateInputSchema,MessageUncheckedCreateInputSchema ]),
}).strict()

export const MessageUpsertArgsSchema: z.ZodType<Prisma.MessageUpsertArgs> = z.object({
  select: MessageSelectSchema.optional(),
  where: MessageWhereUniqueInputSchema,
  create: z.union([ MessageCreateInputSchema,MessageUncheckedCreateInputSchema ]),
  update: z.union([ MessageUpdateInputSchema,MessageUncheckedUpdateInputSchema ]),
}).strict()

export const MessageCreateManyArgsSchema: z.ZodType<Prisma.MessageCreateManyArgs> = z.object({
  data: z.union([ MessageCreateManyInputSchema,MessageCreateManyInputSchema.array() ]),
}).strict()

export const MessageDeleteArgsSchema: z.ZodType<Prisma.MessageDeleteArgs> = z.object({
  select: MessageSelectSchema.optional(),
  where: MessageWhereUniqueInputSchema,
}).strict()

export const MessageUpdateArgsSchema: z.ZodType<Prisma.MessageUpdateArgs> = z.object({
  select: MessageSelectSchema.optional(),
  data: z.union([ MessageUpdateInputSchema,MessageUncheckedUpdateInputSchema ]),
  where: MessageWhereUniqueInputSchema,
}).strict()

export const MessageUpdateManyArgsSchema: z.ZodType<Prisma.MessageUpdateManyArgs> = z.object({
  data: z.union([ MessageUpdateManyMutationInputSchema,MessageUncheckedUpdateManyInputSchema ]),
  where: MessageWhereInputSchema.optional(),
}).strict()

export const MessageDeleteManyArgsSchema: z.ZodType<Prisma.MessageDeleteManyArgs> = z.object({
  where: MessageWhereInputSchema.optional(),
}).strict()

export const ChatGPTCallCreateArgsSchema: z.ZodType<Prisma.ChatGPTCallCreateArgs> = z.object({
  select: ChatGPTCallSelectSchema.optional(),
  data: z.union([ ChatGPTCallCreateInputSchema,ChatGPTCallUncheckedCreateInputSchema ]),
}).strict()

export const ChatGPTCallUpsertArgsSchema: z.ZodType<Prisma.ChatGPTCallUpsertArgs> = z.object({
  select: ChatGPTCallSelectSchema.optional(),
  where: ChatGPTCallWhereUniqueInputSchema,
  create: z.union([ ChatGPTCallCreateInputSchema,ChatGPTCallUncheckedCreateInputSchema ]),
  update: z.union([ ChatGPTCallUpdateInputSchema,ChatGPTCallUncheckedUpdateInputSchema ]),
}).strict()

export const ChatGPTCallCreateManyArgsSchema: z.ZodType<Prisma.ChatGPTCallCreateManyArgs> = z.object({
  data: z.union([ ChatGPTCallCreateManyInputSchema,ChatGPTCallCreateManyInputSchema.array() ]),
}).strict()

export const ChatGPTCallDeleteArgsSchema: z.ZodType<Prisma.ChatGPTCallDeleteArgs> = z.object({
  select: ChatGPTCallSelectSchema.optional(),
  where: ChatGPTCallWhereUniqueInputSchema,
}).strict()

export const ChatGPTCallUpdateArgsSchema: z.ZodType<Prisma.ChatGPTCallUpdateArgs> = z.object({
  select: ChatGPTCallSelectSchema.optional(),
  data: z.union([ ChatGPTCallUpdateInputSchema,ChatGPTCallUncheckedUpdateInputSchema ]),
  where: ChatGPTCallWhereUniqueInputSchema,
}).strict()

export const ChatGPTCallUpdateManyArgsSchema: z.ZodType<Prisma.ChatGPTCallUpdateManyArgs> = z.object({
  data: z.union([ ChatGPTCallUpdateManyMutationInputSchema,ChatGPTCallUncheckedUpdateManyInputSchema ]),
  where: ChatGPTCallWhereInputSchema.optional(),
}).strict()

export const ChatGPTCallDeleteManyArgsSchema: z.ZodType<Prisma.ChatGPTCallDeleteManyArgs> = z.object({
  where: ChatGPTCallWhereInputSchema.optional(),
}).strict()