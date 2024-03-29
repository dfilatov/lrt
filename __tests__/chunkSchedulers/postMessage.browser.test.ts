import { createScheduler, Scheduler } from '../../src';
import { simpleGenerator } from '../utils';

describe('postMessage chunk scheduler', () => {
    let scheduler: Scheduler;

    beforeEach(() => {
        scheduler = createScheduler({
            chunkScheduler: 'postMessage'
        });
    });

    it('should use window.postMessage()', done => {
        spyOn(window, 'postMessage').and.callThrough();

        scheduler.runTask(simpleGenerator()).then(() => {
            expect((window.postMessage as jasmine.Spy).calls.count()).toEqual(10);
            done();
        });
    });
});
