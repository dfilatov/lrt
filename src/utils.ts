const now: () => number = typeof performance === 'object' && typeof performance.now === 'function' ?
    () => performance.now() :
    Date.now;

const microtaskPromise = Promise.resolve();

function microtask(fn: () => void): void {
    microtaskPromise.then(fn);
}

export {
    now,
    microtask
};
