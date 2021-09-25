import { ChunkSchedulerType } from './chunkSchedulers';

interface Scheduler {
    runTask<T = void>(iterator: Iterator<unknown, T>): Promise<T>;
    abortTask(promise: Promise<unknown>): void;
}

interface SchedulerOptions {
    chunkScheduler?: ChunkSchedulerType | ChunkSchedulerType[];
    chunkBudget?: number;
}

interface Task<T = void> {
    value: unknown;
    iterator: Iterator<unknown, T, unknown>;
    iterationCount: number;
    meanIterationElapsedTime: number;
    totalElapsedTime: number;
    resolve(result: T): void;
    reject(reason: unknown): void;
}

export {
    Scheduler,
    SchedulerOptions,
    Task
};
