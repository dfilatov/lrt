type ChunkSchedulerType =
    'requestAnimationFrame' |
    'requestIdleCallback' |
    'setImmediate' |
    'timeout' |
    'auto' |
    ChunkScheduler;

interface ChunkScheduler<T = unknown> {
    set(fn: () => T): T;
    clear?(t: T): void;
}

export {
    ChunkSchedulerType,
    ChunkScheduler
};
