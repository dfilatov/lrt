import { ChunkSchedulerType } from './chunkSchedulers';

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

interface Task<T> {
    run(): Promise<T>;
    abort(): void;
}

interface TaskOptions<T> {
    unit: Unit<T>;
    chunkBudget?: number;
    chunkScheduler?: ChunkSchedulerType;
}

export {
    Unit,
    NextUnit,
    Task,
    TaskOptions
};
