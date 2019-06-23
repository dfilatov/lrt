import { createScheduler } from '../src';
import { now } from '../src/utils';

describe('runTask', () => {
    it('should fulfill promise with result after task has completed', done => {
        createScheduler().runTask(function unit(i: number = 0) {
            sleep(10);

            return {
                next: i < 9 ? unit : null,
                result: i + 1
            };
        }).then(result => {
            expect(result).toBe(10);
            done();
        });
    });

    it('should complete task even its unit takes more time than budget', done => {
        createScheduler({ chunkBudget: 5 }).runTask(function unit(i: number = 0) {
            sleep(10);

            return {
                next: i < 9 ? unit : null,
                result: i + 1
            };
        }).then(result => {
            expect(result).toBe(10);
            done();
        });
    });

    it('should run a couple of tasks concurrently', done => {
        const scheduler = createScheduler();
        const order: string[] = [];

        Promise.all([
            scheduler.runTask(function unit1(i: number = 0) {
                sleep(10);
                order.push('unit1');

                return {
                    next: i < 4 ? unit1 : null,
                    result: i + 1
                };
            }),
            scheduler.runTask(function unit2(i: number = 0) {
                sleep(10);
                order.push('unit2');

                return {
                    next: i < 8 ? unit2 : null,
                    result: i + 2
                };
            })
        ]).then(([result1, result2]) => {
            expect(order)
                .toEqual(['unit1', 'unit2', 'unit1', 'unit2', 'unit1', 'unit2', 'unit1', 'unit2', 'unit1', 'unit2']);
            expect(result1).toBe(5);
            expect(result2).toBe(10);
            done();
        });
    });

    it('should reject promise if unit throws exception', done => {
        const err = new Error();

        createScheduler().runTask(function unit(i: number = 0) {
            sleep(10);

            if(i > 4) {
                throw err;
            }

            return {
                next: unit,
                result: i + 1
            };
        }).catch(_err => {
            expect(_err).toBe(err);
            done();
        });
    });
});

describe('abortTask', () => {
    it('should be aborted after a while', done => {
        const scheduler = createScheduler();
        const task = scheduler.runTask(function unit(i: number = 0) {
            sleep(10);

            return {
                next: i < 9 ? unit : null,
                result: i + 1
            };
        });

        task.then(
            () => {
                done('Aborted task mustn\'t be completed');
            },
            () => {
                done('Aborted task mustn\'t be rejected');
            }
        );

        setTimeout(() => scheduler.abortTask(task), 50);
        setTimeout(() => done(), 300);
    });

    it('should be aborted immediately', done => {
        const scheduler = createScheduler();
        const task = scheduler.runTask(() => ({ next: null }));

        task.then(
            () => {
                done('Aborted task mustn\'t be completed');
            },
            () => {
                done('Aborted task mustn\'t be rejected');
            }
        );

        scheduler.abortTask(task);

        setTimeout(() => done(), 100);
    });

    it('should not affect other pending tasks', done => {
        const scheduler = createScheduler();
        const task1 = scheduler.runTask(function unit(i: number = 0) {
            sleep(10);

            return {
                next: i < 9 ? unit : null,
                result: i + 1
            };
        });
        const task2 = scheduler.runTask(function unit(i: number = 0) {
            sleep(10);

            return {
                next: i < 9 ? unit : null,
                result: i + 1
            };
        });

        scheduler.abortTask(task1);

        task2.then(result => {
            expect(result).toBe(10);
            done();
        });
    });
});

function sleep(ms: number): void {
    const startTime = now();

    while(now() - startTime < ms) {}
}
