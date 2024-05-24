import { logger } from '@root/core/logging/logger';
import { Worker, isMainThread } from 'worker_threads';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export type WorkerMessage = {
  data: any,
} | {
  info: string,
} | {
  error: WorkerError
} | {
  free: boolean
}

export type WorkerError = {
  message: string,
  name?: string
}

const registeredWorkers = {
  'trainBot': `${path.join(__dirname, 'trainBot.ts')}`,
} as const;
export type WorkerName = keyof typeof registeredWorkers;

const workersPool: (Worker & { free?: boolean })[] = [];
export const getWorkersPool = () => workersPool;
const workersLimit = 1;

export const promisifiedWorkerFromFunction = <T extends ((args: Args) => ReturnType<T>), Args>(workerFunction: T, data: Args) => new Promise<ReturnType<T>>((resolve, reject) => {
  const blobURL = URL.createObjectURL(new Blob(['(', workerFunction.toString(), ')'], { type: 'application/javascript' }));
  const result = promisifiedWorker(blobURL, data) as Promise<ReturnType<T>>;
  URL.revokeObjectURL(blobURL);
  return result;
});

export const knownPromisifiedWorker = <T>(workerName: WorkerName, data: T) => promisifiedWorker(registeredWorkers[workerName], data);

export const triggerKnownWorker = <T extends object>(workerName: WorkerName, data: T) => triggerWorker(registeredWorkers[workerName], data);

const workerLimit = 2;
let nextWorkerIdx = 0;
export const triggerWorker = async <T extends object>(filePath: string, data: T) => {
  if (workersPool.length < workerLimit) {
    const w1: typeof workersPool[number] = new Worker(filePath);
    w1.on('message', async (message: WorkerMessage) => {
      if ('info' in message) {
        logger.info(message.info);
        return;
      } else if ('error' in message) {
        logger.error(message.error.message);
        return;
      } else if ('data' in message) {
        logger.info(message.data);
        return;
      } else if ('free' in message) {
        w1.free = message.free;
        return;
      }
      throw new Error('Invalid worker message');
    });
    w1.on('error', (error) => {
      logger.error(`${error}`);
    });
    w1.on('exit', (code) => {
      if (code !== 0)
        logger.error(new Error(`Worker stopped with exit code ${code}`));
      workersPool.pop();
    });
    workersPool.push(w1);
  }
  const freeWorker = workersPool.find((wrk) => wrk.free);
  const worker = freeWorker || workersPool[nextWorkerIdx];
  worker.postMessage(Object.assign(data, { workerId: nextWorkerIdx }));
  nextWorkerIdx = ++nextWorkerIdx % workerLimit;
}

export const promisifiedWorker = <T>(filePath: WorkerName | string, data: T) => new Promise((resolve, reject) => {
  if (workersPool.length === workersLimit) {
    return;
  }
  const worker = new Worker(filePath);
  workersPool.push(worker);
  worker.on('message', async (message: WorkerMessage) => {
    if ('info' in message) {
      logger.info(message.info);
      return;
    } else if ('error' in message) {
      logger.error(message.error.message);
      reject(message.error);
      return;
    } else if ('data' in message) {
      resolve(message.data);
      return;
    }
    throw new Error('Invalid worker message');
  });
  worker.on('error', reject);
  worker.on('exit', (code) => {
    if (code !== 0)
      reject(new Error(`Worker stopped with exit code ${code}`));
  });
});