import { ChunkSchedulerType } from './chunkSchedulers';

interface Scheduler {
    runTask<T = void>(unit: Unit<T>): Promise<T>;
    abortTask(promise: Promise<unknown>): void;
}

interface SchedulerOptions {
    chunkScheduler?: ChunkSchedulerType;
    chunkBudget?: number;
}

interface Task<T = void> {
    result: T | undefined;
    nextUnit: NextUnit<T>;
    executedUnitCount: number;
    meanUnitElapsedTime: number;
    totalElapsedTime: number;
    resolve(result: unknown): void;
    reject(reason: unknown): void;
}

interface Unit<T = void> {
    (prevValue?: T): T extends void?
        {
            result?: undefined;
            next: NextUnit<T>;
        } :
        {
            result: T;
            next: NextUnit<T>;
        };
}

type NextUnit<T> = Unit<T> | null;

export {
    Scheduler,
    SchedulerOptions,
    Task,
    Unit
};
