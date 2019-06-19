import { createTask } from '../src';
import { now } from '../src/now';

it('should fulfill promise with result after job has done', done => {
    createTask({
        unit: function unit(i: number = 1) {
            sleep(10);

            return {
                next: i < 9? unit : null,
                result: i + 1
            };
        }
    }).run().then(result => {
        expect(result).toBe(10);
        done();
    });
});

it('should reject promise if unit throws exception', done => {
    const err = new Error();

    createTask({
        unit: function unit(i: number = 1) {
            sleep(10);

            if(i > 5) {
                throw err;
            }

            return {
                next: unit,
                result: i + 1
            };
        }
    }).run().catch(_err => {
        expect(_err).toBe(err);
        done();
    });
});

it('should be abortable', done => {
    const task = createTask({
        unit: function unit(i: number = 1) {
            sleep(10);

            return {
                next: i < 10? unit : null,
                result: i + 1
            };
        }
    });

    task.run().then(
        () => {
            done('Aborted task mustn\'t be completed');
        },
        () => {
            done('Aborted task mustn\'t be rejected');
        }
    );

    setTimeout(task.abort, 50);
    setTimeout(() => done(), 300);
});

function sleep(ms: number): void {
    const startTime = now();

    while(now() - startTime < ms) {}
}
