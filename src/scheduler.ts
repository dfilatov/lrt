import { getChunkScheduler } from './chunkSchedulers';
import { now, microtask } from './utils';
import { Scheduler, SchedulerOptions, Task, Unit } from './types';

function createScheduler({
    chunkScheduler: chunkSchedulerType = 'auto',
    chunkBudget = 10
}: SchedulerOptions = {}): Scheduler {
    const pendingTasks = new Map<Promise<unknown>, Task<unknown>>();
    const chunkScheduler = getChunkScheduler(chunkSchedulerType);
    let chunkSchedulerToken: unknown = null;
    let tasksOrder: Promise<unknown>[] = [];

    function chunk(): void {
        chunkSchedulerToken = null;

        let checkBudget = false;
        let startTime = now();
        let restBudget = chunkBudget;
        const nextTasksOrder = [];

        while(tasksOrder.length > 0) {
            const promise = tasksOrder.shift()!;
            const task = pendingTasks.get(promise)!;
            let unitExecuted = false;

            if(checkBudget && restBudget < task.meanUnitElapsedTime) {
                nextTasksOrder.push(promise);
            }
            else {
                checkBudget = true;

                try {
                    const { next, result } = task.nextUnit!(task.result);

                    unitExecuted = true;

                    task.nextUnit = next;
                    task.result = result;

                    if(next === null) {
                        pendingTasks.delete(promise);
                        task.resolve(result);
                    }
                    else {
                        tasksOrder.push(promise);
                    }
                }
                catch(e) {
                    pendingTasks.delete(promise);
                    task.reject(e);
                }
            }

            const elapsedTime = now() - startTime;

            if(unitExecuted) {
                task.executedUnitCount++;
                task.totalElapsedTime += elapsedTime;
                task.meanUnitElapsedTime = task.totalElapsedTime / task.executedUnitCount;
            }

            restBudget -= elapsedTime;
            startTime += elapsedTime;
        }

        if(nextTasksOrder.length > 0) {
            tasksOrder = nextTasksOrder;
            chunkSchedulerToken = chunkScheduler.request(chunk);
        }
    }

    return {
        runTask<T = void>(unit: Unit<T>): Promise<T> {
            let task: Task<T>;
            const promise = new Promise<T>((resolve, reject) => {
                task = {
                    nextUnit: unit,
                    result: undefined,
                    executedUnitCount: 0,
                    totalElapsedTime: 0,
                    meanUnitElapsedTime: 0,
                    resolve,
                    reject
                };
            });

            pendingTasks.set(promise, <Task<unknown>>task!);

            microtask(() => {
                // check if it's not already aborted
                if(!pendingTasks.has(promise)) {
                    return;
                }

                tasksOrder.push(promise);

                if(tasksOrder.length === 1) {
                    chunkSchedulerToken = chunkScheduler.request(chunk);
                }
            });

            return promise;
        },

        abortTask(promise: Promise<unknown>): void {
            if(pendingTasks.delete(promise)) {
                const taskOrderIdx = tasksOrder.indexOf(promise);

                // task can be absent if it's added to pending tasks via `runTask` but then
                // `abortTask` is called synchronously before microtask callback is invoked
                if(taskOrderIdx > -1) {
                    tasksOrder.splice(taskOrderIdx, 1);

                    if(tasksOrder.length === 0 && chunkScheduler.cancel && chunkSchedulerToken !== null) {
                        chunkScheduler.cancel(chunkSchedulerToken);
                        chunkSchedulerToken = null;
                    }
                }
            }
        }
    };
}

export {
    createScheduler
};
