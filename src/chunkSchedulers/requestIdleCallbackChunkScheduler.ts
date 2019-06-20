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

declare global {
    interface Window {
        requestIdleCallback?(
            callback: RequestIdleCallback,
            options?: RequestIdleCallbackOptions
        ): number;
        cancelIdleCallback?(handle: number): void;
    }
}

const requestIdleCallbackChunkScheduler: ChunkScheduler<number> | null =
    typeof window !== 'undefined' &&
    typeof window.requestIdleCallback === 'function' &&
    typeof window.cancelIdleCallback === 'function' ?
        {
            set: fn => window.requestIdleCallback!(fn),
            clear: token => window.cancelIdleCallback!(token)
        } :
        null;

export {
    requestIdleCallbackChunkScheduler
};
