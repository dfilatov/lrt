import { ChunkScheduler, ChunkSchedulerType } from './types';
import { animationFrameChunkScheduler } from './animationFrame';
import { idleCallbackChunkScheduler } from './idleCallback';
import { immediateChunkScheduler } from './immediate';
import { postMessageScheduler } from './postMessage';
import { timeoutChunkScheduler } from './timeout';

const BUILTIN_CHUNK_SHEDULERS: Record<Extract<ChunkSchedulerType, string>, ChunkScheduler | null> = {
    auto:
        idleCallbackChunkScheduler ||
        animationFrameChunkScheduler ||
        immediateChunkScheduler ||
        postMessageScheduler,
    animationFrame: animationFrameChunkScheduler,
    idleCallback: idleCallbackChunkScheduler,
    immediate: immediateChunkScheduler,
    postMessage: postMessageScheduler,
    timeout: timeoutChunkScheduler
};

function getChunkScheduler(type: ChunkSchedulerType | ChunkSchedulerType[]): ChunkScheduler {
    if(typeof type === 'string') {
        return BUILTIN_CHUNK_SHEDULERS[type] || timeoutChunkScheduler;
    }

    if(Array.isArray(type)) {
        for(let i = 0; i < type.length; i++) {
            const item = type[i];

            if(typeof item === 'string') {
                const chunkScheduler = BUILTIN_CHUNK_SHEDULERS[item];

                if(chunkScheduler) {
                    return chunkScheduler;
                }
            } else {
                return item;
            }
        }

        return timeoutChunkScheduler;
    }

    return type;
}

export {
    ChunkSchedulerType,
    ChunkScheduler,

    getChunkScheduler
};
