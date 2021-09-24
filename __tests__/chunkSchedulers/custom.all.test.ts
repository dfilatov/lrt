import { createScheduler, ChunkScheduler, Scheduler } from '../../src';
import { simpleGenerator } from '../utils';

describe('custom chunk scheduler', () => {
    const customChunkScheduler: ChunkScheduler<NodeJS.Timeout> = {
        request: fn => globalThis.setTimeout(fn, 50),
        cancel: token => globalThis.clearTimeout(token)
    };
    let scheduler: Scheduler;

    beforeEach(() => {
        scheduler = createScheduler({
            chunkScheduler: customChunkScheduler
        });
    });

    it('should use custom implementation', done => {
        spyOn(customChunkScheduler, 'request').and.callThrough();

        scheduler.runTask(simpleGenerator()).then(() => {
            expect((customChunkScheduler.request as jasmine.Spy).calls.count()).toEqual(10);
            done();
        });
    });
});
