import { Unit, NextUnit, Task } from './types';
import { ChunkSchedulerType, getChunkScheduler } from './chunkSchedulers';
import { now } from './now';

const DEFAULT_CHUNK_BUDGET = 12;

function createTask<T = undefined>({
    unit,
    chunkBudget = DEFAULT_CHUNK_BUDGET,
    chunkScheduler: chunkSchedulerType = 'auto'
}: {
    unit: Unit<T>;
    chunkBudget?: number;
    chunkScheduler?: ChunkSchedulerType;
}): Task<T> {
    const chunkScheduler = getChunkScheduler(chunkSchedulerType);
    let chunkSchedulerToken: unknown = null;
    let nextUnit: NextUnit<T> = unit;
    let result: T | undefined = undefined;
    let aborted = false;
    let promise: Promise<T> | null = null;

    return {
        run() {
            if(promise !== null) {
                return promise;
            }

            return promise = new Promise((resolve, reject) => {
                chunkSchedulerToken = chunkScheduler.set(function chunk(): void {
                    if(aborted) {
                        return;
                    }

                    let restBudget = chunkBudget;

                    while(nextUnit !== null) {
                        const startTime = now();

                        try {
                            ({ next: nextUnit, result } = unit(result));
                        }
                        catch(e) {
                            reject(e);
                            return;
                        }

                        const elapsedTime = now() - startTime;

                        restBudget -= elapsedTime;

                        if(restBudget < elapsedTime) {
                            break;
                        }
                    }

                    if(nextUnit === null) {
                        resolve(result);
                    }
                    else {
                        chunkSchedulerToken = chunkScheduler.set(chunk);
                    }
                });
            });
        },

        abort() {
            if(chunkScheduler.clear && chunkSchedulerToken !== null) {
                chunkScheduler.clear(chunkSchedulerToken);
                chunkSchedulerToken = null;
            }

            aborted = true;
        }
    };
}

export {
    createTask
};
