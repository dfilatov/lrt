import { NextUnit, Task, TaskOptions } from './types';
import { getChunkScheduler } from './chunkSchedulers';
import { now } from './now';

const DEFAULT_CHUNK_BUDGET = 12;

function createTask<T = void>(
    {
        unit,
        chunkBudget = DEFAULT_CHUNK_BUDGET,
        chunkScheduler: chunkSchedulerType = 'auto'
    }: TaskOptions<T>
): Task<T> {
    const chunkScheduler = getChunkScheduler(chunkSchedulerType);
    let chunkSchedulerToken: unknown = null;
    let nextUnit: NextUnit<T> = unit;
    let result: T | undefined;
    let aborted = false;
    let promise: Promise<T> | null = null;

    return {
        run() {
            if(promise !== null) {
                return promise;
            }

            return promise = new Promise((resolve, reject) => {
                chunkSchedulerToken = chunkScheduler.request(function chunk(): void {
                    // needed for chunk schedulers without cancellation api
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
                        chunkSchedulerToken = chunkScheduler.request(chunk);
                    }
                });
            });
        },

        abort() {
            if(chunkScheduler.cancel && chunkSchedulerToken !== null) {
                chunkScheduler.cancel(chunkSchedulerToken);
                chunkSchedulerToken = null;
            }

            aborted = true;
        }
    };
}

export {
    createTask
};
