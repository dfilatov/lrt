import { ChunkScheduler, ChunkSchedulerType } from './types';
import { animationFrameChunkScheduler } from './animationFrameChunkScheduler';
import { idleCallbackChunkScheduler } from './idleCallbackChunkScheduler';
import { immediateChunkScheduler } from './immediateChunkScheduler';
import { timeoutChunkScheduler } from './timeoutChunkScheduler';

function getChunkScheduler(kind: ChunkSchedulerType): ChunkScheduler {
    let chunkScheduler: ChunkScheduler | null = null;

    switch(kind) {
        case 'animationFrame':
            chunkScheduler = animationFrameChunkScheduler;
            break;

        case 'idleCallback':
            chunkScheduler = idleCallbackChunkScheduler;
            break;

        case 'immediate':
            chunkScheduler = immediateChunkScheduler;
            break;

        case 'timeout':
            chunkScheduler = timeoutChunkScheduler;
            break;

        case 'auto':
            chunkScheduler =
                idleCallbackChunkScheduler ||
                animationFrameChunkScheduler ||
                immediateChunkScheduler;
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
