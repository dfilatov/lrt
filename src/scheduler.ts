import { getChunkScheduler } from './chunkSchedulers';
import { now, microtask } from './utils';
import { Scheduler, SchedulerOptions, Task } from './types';

const DEFAULT_CHUNK_SCHEDULER_TYPE = 'auto';
const DEFAULT_CHUNK_BUDGET = 10;

function createScheduler({
    chunkScheduler: chunkSchedulerType = DEFAULT_CHUNK_SCHEDULER_TYPE,
    chunkBudget = DEFAULT_CHUNK_BUDGET
}: SchedulerOptions = {}): Scheduler {
    const pendingTasks = new Map<Promise<unknown>, Task<unknown>>();
    const chunkScheduler = getChunkScheduler(chunkSchedulerType);
    let chunkSchedulerToken: unknown = null;
    let tasksOrder: Promise<unknown>[] = [];

    function chunk(): void {
        chunkSchedulerToken = null;

        let iterationStartTime = now();
        let checkBudget = false;
        let restChunkBudget = chunkBudget;
        const nextTasksOrder: Promise<unknown>[] = [];

        while(tasksOrder.length > 0) {
            const taskPromise = tasksOrder.shift()!;
            const task = pendingTasks.get(taskPromise)!;
            let iterated = false;

            if(checkBudget && restChunkBudget < task.meanIterationElapsedTime) {
                nextTasksOrder.push(taskPromise);
            }
            else {
                checkBudget = true;

                try {
                    const { value, done } = task.iterator.next(task.value);

                    iterated = true;

                    task.value = value;

                    if(done) {
                        pendingTasks.delete(taskPromise);
                        task.resolve(value);
                    }
                    else {
                        tasksOrder.push(taskPromise);
                    }
                }
                catch(e) {
                    pendingTasks.delete(taskPromise);
                    task.reject(e);
                }
            }

            const iterationElapsedTime = now() - iterationStartTime;

            if(iterated) {
                task.iterationCount++;
                task.totalElapsedTime += iterationElapsedTime;
                task.meanIterationElapsedTime = task.totalElapsedTime / task.iterationCount;
            }

            restChunkBudget -= iterationElapsedTime;
            iterationStartTime += iterationElapsedTime;
        }

        if(nextTasksOrder.length > 0) {
            tasksOrder = nextTasksOrder;
            chunkSchedulerToken = chunkScheduler.request(chunk);
        }
    }

    return {
        runTask<T = void>(taskIterator: Iterator<unknown, T>): Promise<T> {
            let task: Task<T>;
            const taskPromise = new Promise<T>((resolve, reject) => {
                task = {
                    value: undefined,
                    iterator: taskIterator,
                    iterationCount: 0,
                    meanIterationElapsedTime: 0,
                    totalElapsedTime: 0,
                    resolve,
                    reject
                };
            });

            pendingTasks.set(taskPromise, task!);

            microtask(() => {
                // check if it's not already aborted
                if(!pendingTasks.has(taskPromise)) {
                    return;
                }

                tasksOrder.push(taskPromise);

                if(tasksOrder.length === 1) {
                    chunkSchedulerToken = chunkScheduler.request(chunk);
                }
            });

            return taskPromise;
        },

        abortTask(taskPromise: Promise<unknown>): void {
            if(pendingTasks.delete(taskPromise)) {
                const taskOrderIdx = tasksOrder.indexOf(taskPromise);

                // task can be absent if it's added to pending tasks via `runTask` but then
                // `abortTask` is called synchronously before invoking microtask callback
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
