import { createScheduler, Scheduler } from '../../src';
import { simpleGenerator } from '../utils';

describe('timeout chunk scheduler', () => {
    let scheduler: Scheduler;

    beforeEach(() => {
        scheduler = createScheduler({
            chunkScheduler: 'timeout'
        });
    });

    it('should use window.setTimeout()', done => {
        spyOn(window, 'setTimeout').and.callThrough();

        scheduler.runTask(simpleGenerator()).then(() => {
            expect((window.setTimeout as unknown as jasmine.Spy).calls.count()).toEqual(10);
            done();
        });
    });
});
