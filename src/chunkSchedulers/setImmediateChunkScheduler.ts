import { ChunkScheduler } from './types';

const setImmediateChunkScheduler: ChunkScheduler<NodeJS.Immediate> | null =
    typeof setImmediate === 'function' &&
    typeof clearImmediate === 'function' ?
        {
            set: fn => setImmediate(fn),
            clear: token => clearImmediate(token)
        } :
        null;

export {
    setImmediateChunkScheduler
};
