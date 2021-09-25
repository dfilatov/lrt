import { getChunkScheduler } from '../../src/chunkSchedulers';
import { timeoutChunkScheduler } from '../../src/chunkSchedulers/timeout';
import { immediateChunkScheduler } from '../../src/chunkSchedulers/immediate';

describe('getChunkScheduler()', () => {
    it('should properly detect supported chunk scheduler', () => {
        expect(getChunkScheduler('animationFrame')).toBe(timeoutChunkScheduler);
        expect(getChunkScheduler(['animationFrame', 'idleCallback'])).toBe(timeoutChunkScheduler);
        expect(getChunkScheduler('immediate')).toBe(immediateChunkScheduler!);
        expect(getChunkScheduler(['animationFrame', 'immediate'])).toBe(immediateChunkScheduler!);
        expect(getChunkScheduler(['animationFrame'])).toBe(timeoutChunkScheduler);
        expect(getChunkScheduler(['auto'])).toBe(immediateChunkScheduler!);
    });
});
