import { ChunkScheduler, ChunkSchedulerType } from './types';
import { requestAnimationFrameChunkScheduler } from './requestAnimationFrameChunkScheduler';
import { requestIdleCallbackChunkScheduler } from './requestIdleCallbackChunkScheduler';
import { setImmediateChunkScheduler } from './setImmediateChunkScheduler';
import { timeoutChunkScheduler } from './timeoutChunkScheduler';

function getChunkScheduler(kind: ChunkSchedulerType): ChunkScheduler {
    let chunkScheduler: ChunkScheduler | null = null;

    switch(kind) {
        case 'requestAnimationFrame':
            chunkScheduler = requestAnimationFrameChunkScheduler;
            break;

        case 'requestIdleCallback':
            chunkScheduler = requestIdleCallbackChunkScheduler;
            break;

        case 'setImmediate':
            chunkScheduler = setImmediateChunkScheduler;
            break;

        case 'timeout':
            chunkScheduler = timeoutChunkScheduler;
            break;

        case 'auto':
            chunkScheduler =
                requestIdleCallbackChunkScheduler ||
                requestAnimationFrameChunkScheduler ||
                setImmediateChunkScheduler;
            break;

        default:
            chunkScheduler = kind;
    }

    return chunkScheduler || timeoutChunkScheduler;
}

export {
    ChunkSchedulerType,
    ChunkScheduler,

    getChunkScheduler
};
