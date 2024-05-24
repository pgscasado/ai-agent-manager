import { Bots } from '@root/controllers/Bots'
import { AIMessage, BaseMessage, HumanMessage, SystemMessage } from 'langchain/schema'
import { openaiInstance } from '../openai'
import { Prisma } from '@prisma/client';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { DataURIRegex, getAttachmentFieldFromSegment, isDataURI, segmentAsJSON } from '../fileAttachment';

export const chooseAttachment = (segments: Awaited<ReturnType<typeof Bots.functions.relatedSegments>>, response: string, openaiInstance: openaiInstance, bot: Prisma.BotCreateInput, aiConfigs: ChatOpenAI) => {
  const messages: BaseMessage[] = [
    new HumanMessage(`[Interaction] ${response}\n---[List of informations]${segments.map(serializeDataURISegment).map(({segment}, idx) => `Index ${idx + 1}: ${segment}`).join('\n')}\n---\nYou're receiving a interaction between a user and a chat-bot with a context and a list of informations. There's an attachment URL (followed by [attachment] tag) which will be sent to the user on each item. Decide which item in this list is more related with the interaction, and tell me what index it is located in the list. Just the number, e.g. "13" then stop. If no item is related with the interaction, answer "-1" then stop.`),
    new AIMessage('Index: ')
  ];
  return openaiInstance(messages, bot, aiConfigs);
}

export const serializeDataURISegment = (segmentData: Awaited<ReturnType<typeof Bots.functions.relatedSegments>>[number]) => {
  const clonedData = { ...segmentData };
  const attachmentValue = getAttachmentFieldFromSegment(clonedData);
  if (attachmentValue && isDataURI(attachmentValue)) {
    clonedData.segment = clonedData.segment.replace(DataURIRegex, 'data:<mime>;base64,..."');
  }
  return clonedData;
}