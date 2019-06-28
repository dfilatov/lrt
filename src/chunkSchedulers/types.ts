type ChunkSchedulerType =
    'animationFrame' |
    'idleCallback' |
    'immediate' |
    'timeout' |
    'auto' |
    ChunkScheduler;

interface ChunkScheduler<T = unknown> {
    request(fn: () => void): T;
    cancel?(t: T): void;
}

export {
    ChunkSchedulerType,
    ChunkScheduler
};
