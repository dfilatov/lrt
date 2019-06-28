import { getChunkScheduler } from './chunkSchedulers';
import { now, microtask } from './utils';
import { Scheduler, SchedulerOptions, Task } from './types';

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
            let iterated = false;

            if(checkBudget && restBudget < task.meanIterationElapsedTime) {
                nextTasksOrder.push(promise);
            }
            else {
                checkBudget = true;

                try {
                    const { value, done } = task.iterator.next(task.value);

                    iterated = true;

                    task.value = value;

                    if(done) {
                        pendingTasks.delete(promise);
                        task.resolve(value);
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

            if(iterated) {
                task.iterationCount++;
                task.totalElapsedTime += elapsedTime;
                task.meanIterationElapsedTime = task.totalElapsedTime / task.iterationCount;
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
        runTask<T = void>(iterator: Iterator<T>): Promise<T> {
            let task: Task<T>;
            const promise = new Promise<T>((resolve, reject) => {
                task = {
                    value: undefined,
                    iterator,
                    iterationCount: 0,
                    meanIterationElapsedTime: 0,
                    totalElapsedTime: 0,
                    resolve,
                    reject
                };
            });

            pendingTasks.set(promise, task!);

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
