import { createScheduler, Scheduler } from '../../src';
import { simpleGenerator } from '../utils';

describe('idleCallback chunk scheduler', () => {
    let scheduler: Scheduler;

    beforeEach(() => {
        scheduler = createScheduler({
            chunkScheduler: 'idleCallback'
        });
    });

    it('should use window.requestIdleCallback()', done => {
        spyOn(window, 'requestIdleCallback').and.callThrough();

        scheduler.runTask(simpleGenerator()).then(() => {
            expect((window.requestIdleCallback as jasmine.Spy).calls.count()).toEqual(10);
            done();
        });
    });
});
