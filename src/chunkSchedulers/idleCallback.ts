import { ChunkScheduler } from './types';

interface RequestIdleCallbackOptions {
    timeout: number;
}

interface RequestIdleCallbackDeadline {
    readonly didTimeout: boolean;
    timeRemaining(): number;
}

interface RequestIdleCallback {
    (deadline: RequestIdleCallbackDeadline): void;
}

const idleCallbackChunkScheduler: ChunkScheduler<number> | null =
    typeof window !== 'undefined' &&
    typeof window.requestIdleCallback === 'function' &&
    typeof window.cancelIdleCallback === 'function' ?
        {
            request: fn => window.requestIdleCallback(fn),
            cancel: token => window.cancelIdleCallback(token)
        } :
        null;

export {
    idleCallbackChunkScheduler
};
