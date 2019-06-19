interface Unit<T> {
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

type NextUnit<TValue> = Unit<TValue> | null;

interface Scheduler {
    (fn: () => void): void;
}

const DEFAULT_SCHEDULER: Scheduler =
    typeof requestAnimationFrame === 'function'?
        requestAnimationFrame :
        typeof setImmediate === 'function'?
            setImmediate :
            fn => {
                setTimeout(fn, 1000 / 60);
            };
const DEFAULT_BUDGET = 12;

function chunkify<T = undefined>({
    unit,
    budget = DEFAULT_BUDGET,
    scheduler = DEFAULT_SCHEDULER
}: {
    unit: Unit<T>;
    budget?: number;
    scheduler?: Scheduler;
}): {
    promise: Promise<T>;
    abort(): void;
} {
    let aborted = false;

    return {
        promise: new Promise((resolve, reject) => {
            (function scheduleChunk(unit: Unit<T>, prevResult?: T): void {
                scheduler(() => {
                    if(aborted) {
                        return;
                    }

                    let next: NextUnit<T> = unit;
                    let result = prevResult;
                    let restBudget = budget;

                    while(next !== null && restBudget > 0) {
                        const startTime = Date.now();

                        try {
                            ({ next, result } = unit(result));
                        }
                        catch(e) {
                            reject(e);
                            return;
                        }

                        const elapsedTime = Date.now() - startTime;

                        restBudget -= elapsedTime;

                        if(restBudget < elapsedTime) {
                            restBudget = 0;
                        }
                    }

                    if(next === null) {
                        resolve(result);
                    }
                    else {
                        scheduleChunk(next, result);
                    }
                });
            })(unit);
        }),

        abort() {
            aborted = true;
        }
    };
}

export default chunkify;
