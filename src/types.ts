import { ChunkSchedulerType } from './chunkSchedulers';

interface Scheduler {
    runTask<T = void>(iterator: Iterator<T>): Promise<T>;
    abortTask(promise: Promise<unknown>): void;
}

interface SchedulerOptions {
    chunkScheduler?: ChunkSchedulerType;
    chunkBudget?: number;
}

interface Task<T = void> {
    value: T | undefined;
    iterator: Iterator<T>;
    iterationCount: number;
    meanIterationElapsedTime: number;
    totalElapsedTime: number;
    resolve(result: unknown): void;
    reject(reason: unknown): void;
}

export {
    Scheduler,
    SchedulerOptions,
    Task
};
