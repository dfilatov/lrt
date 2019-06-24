import { ChunkScheduler, ChunkSchedulerType } from './types';
import { animationFrameChunkScheduler } from './animationFrame';
import { idleCallbackChunkScheduler } from './idleCallback';
import { immediateChunkScheduler } from './immediate';
import { timeoutChunkScheduler } from './timeout';

const BUILTIN_CHUNK_SHEDULERS: Record<Exclude<ChunkSchedulerType, ChunkScheduler>, ChunkScheduler | null> = {
    auto:
        idleCallbackChunkScheduler ||
        animationFrameChunkScheduler ||
        immediateChunkScheduler,
    animationFrame: animationFrameChunkScheduler,
    idleCallback: idleCallbackChunkScheduler,
    immediate: immediateChunkScheduler,
    timeout: timeoutChunkScheduler
};

function getChunkScheduler(type: ChunkSchedulerType): ChunkScheduler {
    return typeof type === 'string' ?
        BUILTIN_CHUNK_SHEDULERS[type] || timeoutChunkScheduler :
        type;
}

export {
    ChunkSchedulerType,
    ChunkScheduler,

    getChunkScheduler
};
