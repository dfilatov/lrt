type ChunkSchedulerType =
    'animationFrame' |
    'idleCallback' |
    'immediate' |
    'timeout' |
    'auto' |
    ChunkScheduler;

interface ChunkScheduler<T = unknown> {
    request(fn: () => T): T;
    cancel?(t: T): void;
}

export {
    ChunkSchedulerType,
    ChunkScheduler
};
