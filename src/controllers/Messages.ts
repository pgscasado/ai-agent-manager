import { RequestHandler } from '@root/types/express';
import { Bots } from './Bots';
import prisma, { Prisma } from '@root/prisma';
import { UNDEFINED_MESSAGE_TAG, ai, isAttachmentAnswer } from '@root/core/ai';
import { logger } from '@root/core/logging/logger';
import { DataURIRegex } from '@root/core/ai/fileAttachment';
import { execCommand } from '@root/core/commands';

export const getAnswer: RequestHandler<{ text: string, userId: string }, { id: string }> = async (req, res) => {
  const { id } = req.params;
  const { text, userId } = req.body;
  const bot = await Bots.functions.findBot(id);
  if (!bot) {
    return res.status(404).json({ message: 'Bot not found' });
  }
  const commandResult = await execCommand({
    botId: bot.id,
    text,
    timestamp: new Date(),
    userId
  });
  if (commandResult.next === 'stop') {
    const mockedAPIResult: Awaited<ReturnType<typeof ai.getAnswer>> = {
      result: {
        type: 'default',
        asked_for_attendance: 'false',
        response: commandResult.text,
        start_attendance: 'false',
      },
      usage: {
        completion_tokens: 0,
        prompt_tokens: 0,
        total_tokens: 0
      }
    };
    res.json({ ...mockedAPIResult });
    return;
  } 
  if (bot.disabled) {
    const disabledBotMessage = Bots.functions.mockBotMessage('Você está sendo direcionado para o atendimento, aguarde um momento.', { is_bot_disabled: 'true' });
    logger.info(`[AI][DISABLED] Bot is disabled`);
    disabledBotMessage.result.start_attendance = 'true';
    res.json({ ...disabledBotMessage.result });
    return disabledBotMessage;
  }
  try {
    const answer = await ai.getAnswer(text.trim(), bot, req.body.userId);
    answer.result.metadata = answer.result.metadata ?? {};
    answer.result.metadata.is_bot_disabled = 'false';
    res.json({ ...answer.result });
    if (answer.error) {
      return;
    }
    if (isAttachmentAnswer(answer)) {
      answer.result.attachments = answer.result.attachments.map(att => {
        att.url = att.url.replace(DataURIRegex, '<data uri>');
        return att;
      });
    }
    const messageObject: Prisma.MessageCreateInput = {
      botId: bot.id,
      isResponse: false,
      message: text,
      userId,
      response: JSON.stringify({...answer.result, missing_info: answer.result.metadata?.missing_info}),
    }
    if (answer.result.metadata?.is_end_of_conversation) {
      messageObject.flags = { ...(messageObject.flags as Record<string, string> || {}), 'inactive_minutes': true, 'nps_minutes': true }
    }
    prisma.message.create({
      data: messageObject,
    }).catch((err) => logger.error(err));
  } catch (e) {
    logger.error(e);
    res.status(500).json(e);
  }
}

export const getUserMessages: RequestHandler<{ botId: string, userId: string }> = async (req, res) => {
  const { bot_id, user_id } = req.params;
  const bot = await Bots.functions.findBot(bot_id);
  if (!bot) {
    return res.status(404).json({ message: 'Bot not found' });
  }
  const messages = await prisma.message.findMany({
    where: {
      botId: bot_id,
      userId: user_id,
    },
  });
  res.json({ messages });
}

export const insertUserMessage: RequestHandler<{ text: string, userId: string }, { botId: string }> = async (req, res) => {
  const { botId } = req.params;
  const { text, userId } = req.body;
  if (text) {
    const mockedAPIResult: Awaited<ReturnType<typeof ai.getAnswer>> = {
      result: {
        type: 'default',
        asked_for_attendance: 'false',
        response: UNDEFINED_MESSAGE_TAG,
        start_attendance: 'false',
      },
      usage: {
        completion_tokens: 0,
        prompt_tokens: 0,
        total_tokens: 0
      }
    }
    const message: Prisma.MessageCreateInput = {
      botId,
      isResponse: true,
      message: text,
      response: JSON.stringify({...mockedAPIResult.result, missing_info: mockedAPIResult.result.metadata?.missing_info}),
      userId,
    };
    prisma.message.create({ data: message }).catch(e => logger.error(e));
  }
  res.json({ message: 'Message inserted'})
}

export const insertBotMessage: RequestHandler<{ text: string, userId: string, flags?: string[], start_attendance?: `${boolean}`, asked_for_attendance?: `${boolean}` }, { botId: string }> = async (req, res) => {
  const { botId } = req.params;
  const { text, userId, flags, start_attendance, asked_for_attendance } = req.body;
  const bot = await Bots.functions.findBot(botId);
  if (!bot) {
    return res.status(404).json({ message: 'Bot not found' });
  }
  if (text) {
    const mockedAPIResult: Awaited<ReturnType<typeof ai.getAnswer>> = {
      result: {
        type: 'default',
        asked_for_attendance: asked_for_attendance ? `${asked_for_attendance === 'true'}`: 'false',
        response: text,
        start_attendance: start_attendance ? `${start_attendance === 'true'}`: 'false',
      },
      usage: {
        completion_tokens: 0,
        prompt_tokens: 0,
        total_tokens: 0
      }
    }
    const message: Prisma.MessageCreateInput = {
      botId: bot.id!,
      isResponse: true,
      message: UNDEFINED_MESSAGE_TAG,
      response: JSON.stringify({...mockedAPIResult.result, missing_info: mockedAPIResult.result.metadata?.missing_info}),
      userId,
      flags: flags?.reduce((acc, flag) => ({ ...acc, [`${flag}`]: true }), {} as Record<string, true>)
    };
    if (flags) {
      (async () => {
        const lastUserMsg = (await prisma.message.findFirst({
          where: {
            userId,
            isResponse: false
          },
          orderBy: {
            timestamp: 'desc'
          }
        }))!;
        prisma.message.update({
          where: {
            id: lastUserMsg?.id
          },
          data: {
            flags: flags.reduce((acc, flag) => ({ ...acc, [`${flag}`]: true }), {} as Record<string, true>)
          }
        })
      })()
    }
    prisma.message.create({ data: message }).catch(e => logger.error(e));
  }
  res.json({ message: 'Message inserted'})
}

export * as Messages from './Messages';