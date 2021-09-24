import { createScheduler, Scheduler } from '../../src';
import { simpleGenerator } from '../utils';

describe('immediate chunk scheduler', () => {
    let scheduler: Scheduler;

    beforeEach(() => {
        scheduler = createScheduler({
            chunkScheduler: 'immediate'
        });
    });

    it('should use setImmediate()', done => {
        spyOn(globalThis, 'setImmediate').and.callThrough();

        scheduler.runTask(simpleGenerator()).then(() => {
            expect((globalThis.setImmediate as unknown as jasmine.Spy).calls.count()).toEqual(10);
            done();
        });
    });
});
