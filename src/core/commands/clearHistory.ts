import prisma from '@root/prisma';
import { ExecFn, SignatureFn } from '.';

const signature: SignatureFn = (text) => text?.toLowerCase().trim() === '+limpar historico';
const exec: ExecFn = async ({userId, botId}) => {
  if (!userId) {
    return {
      text: 'Não encontrei o ID do usuário',
      next: 'stop'
    };
  }
  if (!botId) {
    return {
      text: 'Não encontrei o ID do bot',
      next: 'stop'
    };
  }
  const result = await prisma.message.deleteMany({
    where: {
      userId,
      botId
    }
  });
  return {
    text: 'Limpei o histórico de mensagens!',
    next: 'stop'
  };
}

export default {
  signature,
  exec
};