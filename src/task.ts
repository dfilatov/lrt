import { Scheduler, DEFAULT_SCHEDULER } from './scheduler';
import { now } from './now';

const DEFAULT_BUDGET = 12;

interface Unit<T = undefined> {
    (prevValue?: T): T extends undefined?
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

function createTask<T = undefined>({
    unit,
    budget = DEFAULT_BUDGET,
    scheduler = DEFAULT_SCHEDULER
}: {
    unit: Unit<T>;
    budget?: number;
    scheduler?: Scheduler<unknown>;
}): Task<T> {
    let nextUnit: NextUnit<T> = unit;
    let result: T | undefined = undefined;
    let aborted = false;
    let promise: Promise<T> | null = null;
    let schedulerToken: unknown = null;

    return {
        run() {
            if(promise !== null) {
                return promise;
            }

            return promise = new Promise((resolve, reject) => {
                schedulerToken = scheduler.set(function chunk(): void {
                    if(aborted) {
                        return;
                    }

                    let restBudget = budget;

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
                        schedulerToken = scheduler.set(chunk);
                    }
                });
            });
        },

        abort() {
            if(scheduler.clear && schedulerToken !== null) {
                scheduler.clear(schedulerToken);
                schedulerToken = null;
            }

            aborted = true;
        }
    };
}

export {
    Unit,
    Task,

    createTask
};
