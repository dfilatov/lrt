import { createScheduler, Scheduler } from '../../src';
import { simpleGenerator } from '../utils';

describe('animationFrame chunk scheduler', () => {
    let scheduler: Scheduler;

    beforeEach(() => {
        scheduler = createScheduler({
            chunkScheduler: 'animationFrame'
        });
    });

    it('should use window.requestAnimationFrame()', done => {
        spyOn(window, 'requestAnimationFrame').and.callThrough();

        scheduler.runTask(simpleGenerator()).then(() => {
            expect((window.requestAnimationFrame as jasmine.Spy).calls.count()).toEqual(10);
            done();
        });
    });
});
