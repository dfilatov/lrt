import { createScheduler } from '../src';
import { emptyGenerator, sleep } from './utils';

describe('runTask', () => {
    it('should fulfill promise with result after task has completed', done => {
        createScheduler().runTask((function*() {
            let i = 0;

            while(i++ < 9) {
                sleep(10);
                yield;
            }

            return i;
        })()).then(result => {
            expect(result).toBe(10);
            done();
        });
    });

    it('should complete task even its iteration takes more time than budget', done => {
        createScheduler({ chunkBudget: 5 }).runTask((function*() {
            let i = 0;

            while(i++ < 9) {
                sleep(10);
                yield;
            }

            return i;
        })()).then(result => {
            expect(result).toBe(10);
            done();
        });
    });

    it('should run a couple of tasks concurrently', done => {
        const scheduler = createScheduler();
        const order: string[] = [];

        Promise.all([
            scheduler.runTask((function*() {
                let i = 0;

                while(i < 5) {
                    sleep(10);
                    order.push('unit1');
                    i++;
                    yield;
                }

                return i;
            })()),
            scheduler.runTask((function*() {
                let i = 0;

                while(i < 9) {
                    sleep(10);
                    order.push('unit2');
                    i += 2;
                    yield;
                }

                return i;
            })())
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

        createScheduler().runTask((function*() {
            let i = 0;

            while(i < 9) {
                sleep(10);

                if(i++ > 4) {
                    throw err;
                }

                yield;
            }

            return i;
        })()).catch(_err => {
            expect(_err).toBe(err);
            done();
        });
    });
});

describe('abortTask', () => {
    it('should be aborted after a while', done => {
        const scheduler = createScheduler();
        const task = scheduler.runTask((function*() {
            let i = 0;

            while(i++ < 9) {
                sleep(10);
                yield;
            }

            return i;
        })());

        task.finally(
            () => {
                done.fail('Aborted task mustn\'t be completed');
            }
        );

        setTimeout(() => scheduler.abortTask(task), 50);
        setTimeout(() => done(), 300);
    });

    it('should be aborted immediately', done => {
        const scheduler = createScheduler();
        const task = scheduler.runTask(emptyGenerator());

        task.finally(
            () => {
                done.fail('Aborted task mustn\'t be completed');
            }
        );

        scheduler.abortTask(task);

        setTimeout(() => done(), 100);
    });

    it('should not affect other pending tasks', done => {
        const scheduler = createScheduler();
        const task1 = scheduler.runTask((function*() {
            let i = 0;

            while(i++ < 5) {
                sleep(10);
                yield;
            }

            return i;
        })());
        const task2 = scheduler.runTask((function*() {
            let i = 0;

            while(i++ < 9) {
                sleep(10);
                yield;
            }

            return i;
        })());

        scheduler.abortTask(task1);

        task1.then(
            () => {
                done.fail('Aborted task mustn\'t be completed');
            },
            () => {
                done.fail('Aborted task mustn\'t be rejected');
            }
        );

        task2.then(result => {
            expect(result).toBe(10);
            done();
        });
    });
});

describe('chunking', () => {
    it('should request chunk after budget has been reached', done => {
        const order: string[] = [];
        const scheduler = createScheduler({
            chunkScheduler: {
                request(fn): void {
                    order.push('chunk');
                    fn();
                }
            },
            chunkBudget: 50
        });

        scheduler.runTask((function*() {
            let i = 0;

            while(i < 5) {
                sleep(20);
                order.push('unit');
                i++;
                yield;
            }

            return i;
        })()).then(() => {
            expect(order).toEqual(['chunk', 'unit', 'unit', 'chunk', 'unit', 'unit', 'chunk', 'unit']);
            done();
        });
    });

    it('should not request chunk if task aborted immediately', () => {
        const requestMock = jasmine.createSpy();
        const scheduler = createScheduler({
            chunkScheduler: {
                request: requestMock
            }
        });

        const task = scheduler.runTask(emptyGenerator());

        scheduler.abortTask(task);

        expect(requestMock).not.toHaveBeenCalled();
    });

    it('should cancel chunk if last task is aborted', done => {
        const cancelMock = jasmine.createSpy();
        const scheduler = createScheduler({
            chunkScheduler: {
                request: fn => setTimeout(fn, 50),
                cancel: (token: number) => {
                    clearTimeout(token);
                    cancelMock();
                }
            }
        });

        const task1 = scheduler.runTask(emptyGenerator());
        const task2 = scheduler.runTask(emptyGenerator());

        setTimeout(
            () => {
                scheduler.abortTask(task1);
                expect(cancelMock).not.toHaveBeenCalled();
                scheduler.abortTask(task2);
                expect(cancelMock.calls.count()).toEqual(1);
                done();
            },
            20
        );
    });
});
