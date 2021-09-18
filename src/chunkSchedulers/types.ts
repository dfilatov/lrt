type ChunkSchedulerType =
    'animationFrame' |
    'idleCallback' |
    'immediate' |
    'postMessage' |
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
