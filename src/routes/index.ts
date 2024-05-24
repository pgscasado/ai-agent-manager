import { Router } from 'express';

import { botRouter as v1BotRouter } from './1.0/bot';
import { messageRouter as v1MessageRouter } from './1.0/message';
import { debugRouter } from './1.0/debug';

const v1Router = Router()
  .use('/bot', v1BotRouter)
  .use('/message', v1MessageRouter)
  .use('/debug', debugRouter)

export const apiRouter = Router()
  .use(v1Router)
  .use('/1.0', v1Router)
  .use('/docs', (_, res) => res.redirect(process.env.PUBLIC_DOCS_URL as string));