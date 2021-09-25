import { getChunkScheduler } from '../../src/chunkSchedulers';
import { timeoutChunkScheduler } from '../../src/chunkSchedulers/timeout';
import { animationFrameChunkScheduler } from '../../src/chunkSchedulers/animationFrame';
import { idleCallbackChunkScheduler } from '../../src/chunkSchedulers/idleCallback';

describe('getChunkScheduler()', () => {
    it('should properly detect supported chunk scheduler', () => {
        expect(getChunkScheduler('animationFrame')).toBe(animationFrameChunkScheduler!);
        expect(getChunkScheduler('immediate')).toBe(timeoutChunkScheduler);
        expect(getChunkScheduler(['immediate', 'animationFrame'])).toBe(animationFrameChunkScheduler!);
        expect(getChunkScheduler(['immediate'])).toBe(timeoutChunkScheduler);
        expect(getChunkScheduler(['auto'])).toBe(idleCallbackChunkScheduler!);
    });
});
