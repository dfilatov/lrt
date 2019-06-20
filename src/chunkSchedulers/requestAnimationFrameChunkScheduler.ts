import { ChunkScheduler } from './types';

const requestAnimationFrameChunkScheduler: ChunkScheduler<number> | null =
    typeof window !== 'undefined' &&
    typeof window.requestAnimationFrame === 'function' &&
    typeof window.cancelAnimationFrame === 'function' ?
        {
            set: fn => window.requestAnimationFrame(fn),
            clear: token => window.cancelAnimationFrame(token)
        } :
        null;

export {
    requestAnimationFrameChunkScheduler
};
