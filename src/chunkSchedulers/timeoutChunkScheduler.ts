import { ChunkScheduler } from './types';

const timeoutChunkScheduler: ChunkScheduler<NodeJS.Timeout> = {
    set: fn => setTimeout(fn, 0),
    clear: token => clearTimeout(token)
};

export {
    timeoutChunkScheduler
};
