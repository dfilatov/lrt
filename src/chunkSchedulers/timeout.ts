import { ChunkScheduler } from './types';

const timeoutChunkScheduler: ChunkScheduler<NodeJS.Timeout> = {
    request: fn => setTimeout(fn, 0),
    cancel: token => clearTimeout(token)
};

export {
    timeoutChunkScheduler
};
