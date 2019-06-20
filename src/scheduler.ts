interface Scheduler<T> {
    set(fn: () => T): T;
    clear?(t: T): void;
}

const DEFAULT_SCHEDULER =
    typeof requestAnimationFrame === 'function'?
        <Scheduler<number>>{
            set: fn => requestAnimationFrame(fn),
            clear: token => cancelAnimationFrame(token)
        } :
        typeof setImmediate === 'function'?
            <Scheduler<NodeJS.Immediate>>{
                set: setImmediate,
                clear: clearImmediate
            } :
            <Scheduler<NodeJS.Timeout>>{
                set: fn => setTimeout(fn, 1000 / 60),
                clear: token => clearTimeout(token)
            };

export {
    Scheduler,

    DEFAULT_SCHEDULER
};
