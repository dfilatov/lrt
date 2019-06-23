import { ChunkScheduler, ChunkSchedulerType } from './types';
import { animationFrameChunkScheduler } from './animationFrame';
import { idleCallbackChunkScheduler } from './idleCallback';
import { immediateChunkScheduler } from './immediate';
import { timeoutChunkScheduler } from './timeout';

function getChunkScheduler(type: ChunkSchedulerType): ChunkScheduler {
    let chunkScheduler: ChunkScheduler | null = null;

    switch(type) {
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
            chunkScheduler = type;
    }

    return chunkScheduler || timeoutChunkScheduler;
}

export {
    ChunkSchedulerType,
    ChunkScheduler,

    getChunkScheduler
};
