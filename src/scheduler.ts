interface Scheduler<T> {
    set(fn: Function): T;
    clear?(t: T): void;
}

const DEFAULT_SCHEDULER =
    typeof requestAnimationFrame === 'function'?
        <Scheduler<number>>{
            set: requestAnimationFrame,
            clear: cancelAnimationFrame
        } :
        typeof setImmediate === 'function'?
            <Scheduler<NodeJS.Immediate>>{
                set: setImmediate,
                clear: clearImmediate
            } :
            <Scheduler<number>>{
                set: fn => setTimeout(fn, 1000 / 60),
                clear: clearTimeout
            };

export {
    Scheduler,

    DEFAULT_SCHEDULER
};
