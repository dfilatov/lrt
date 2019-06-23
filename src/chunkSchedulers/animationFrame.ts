import { ChunkScheduler } from './types';

const animationFrameChunkScheduler: ChunkScheduler<number> | null =
    typeof window !== 'undefined' &&
    typeof window.requestAnimationFrame === 'function' &&
    typeof window.cancelAnimationFrame === 'function' ?
        {
            request: fn => window.requestAnimationFrame(fn),
            cancel: token => window.cancelAnimationFrame(token)
        } :
        null;

export {
    animationFrameChunkScheduler
};
