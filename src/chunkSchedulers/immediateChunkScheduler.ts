import { ChunkScheduler } from './types';

const immediateChunkScheduler: ChunkScheduler<NodeJS.Immediate> | null =
    typeof setImmediate === 'function' &&
    typeof clearImmediate === 'function' ?
        {
            request: fn => setImmediate(fn),
            cancel: token => clearImmediate(token)
        } :
        null;

export {
    immediateChunkScheduler
};
