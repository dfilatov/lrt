import { createScheduler, Scheduler } from '../../src';
import { sleep } from '../utils';

describe('postMessage chunk scheduler', () => {
    let scheduler: Scheduler;

    beforeEach(() => {
        scheduler = createScheduler({
            chunkScheduler: 'postMessage'
        });
    });

    it('should use window.postMessage()', done => {
        spyOn(window, 'postMessage').and.callThrough();

        scheduler.runTask((function*() {
            let i = 0;

            while(i++ < 9) {
                sleep(10);
                yield;
            }
        })()).then(() => {
            expect((window.postMessage as jasmine.Spy).calls.count()).toEqual(10);
            done();
        });
    });
});
