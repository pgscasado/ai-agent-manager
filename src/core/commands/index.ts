import reactivate from './clearHistory';

export type SignatureFn = (text: string) => boolean;
type ExecFnSync = (args: MessageData) => ({
  text: null,
  next: 'continue'
} | {
  text: string,
  next: 'stop'
});
type Promisified<T extends (...a: any) => any> = (...a: Parameters<T>) => Promise<ReturnType<T>>
export type ExecFn = ExecFnSync | Promisified<ExecFnSync>
const commands = {
  reactivate
} as const satisfies { [key: string]: { signature: SignatureFn, exec: ExecFn } }

type MessageData = {
  text: string,
  userId: string,
  botId: string,
  timestamp: Date
}
export const isRegisteredCommand = (text: string): text is keyof typeof commands => Object.values(commands).some(({ signature }) => signature(text));
export const execCommand: ExecFn = async (data: MessageData) => {
  if (isRegisteredCommand(data.text)) {
    const command = Object.values(commands).find(({ signature }) => signature(data.text))!
    return command.exec(data);
  }
  return ({text: null, next: 'continue'});
}