import { getChunkScheduler } from './chunkSchedulers';
import { now, microtask } from './utils';
import { Scheduler, SchedulerOptions, Task, Unit } from './types';

function createScheduler({
    chunkScheduler: chunkSchedulerType = 'auto',
    chunkBudget = 10
}: SchedulerOptions = {}): Scheduler {
    const pendingTasks = new Map<Promise<unknown>, Task>();
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
            let taskExecuted = false;

            if(checkBudget && restBudget < task.prevUnitElapsedTime) {
                nextTasksOrder.push(promise);
            }
            else {
                checkBudget = true;

                try {
                    const { next: nextUnit, result } = task.nextUnit(task.prevUnitResult);

                    taskExecuted = true;

                    if(nextUnit === null) {
                        pendingTasks.delete(promise);
                        task.resolve(result);
                    }
                    else {
                        task.nextUnit = nextUnit;
                        task.prevUnitResult = result;
                        tasksOrder.push(promise);
                    }
                }
                catch(e) {
                    pendingTasks.delete(promise);
                    task.reject(e);
                }
            }

            const elapsedTime = now() - startTime;

            if(taskExecuted) {
                task.prevUnitElapsedTime = elapsedTime;
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
            let task: Task;
            const promise = new Promise<T>((resolve, reject) => {
                task = {
                    nextUnit: <Unit<unknown>>unit,
                    prevUnitResult: undefined,
                    prevUnitElapsedTime: 0,
                    resolve,
                    reject
                };
            });

            pendingTasks.set(promise, task!);

            microtask(() => {
                if(!pendingTasks.has(promise)) {
                    return;
                }

                tasksOrder.push(promise);

                if(tasksOrder.length === 1) {
                    chunkSchedulerToken = chunkScheduler.request(chunk);
                }
            });

            return <Promise<T>>promise;
        },

        abortTask(promise: Promise<unknown>): void {
            if(pendingTasks.delete(promise)) {
                const taskOrderIdx = tasksOrder.indexOf(promise);

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
