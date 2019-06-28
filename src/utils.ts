const now: () => number = typeof performance === 'object' && typeof performance.now === 'function' ?
    () => performance.now() :
    (() => {
        if(!process.env.BROWSER) {
            try {
                return require('perf_hooks').performance.now;
            }
            catch {}
        }

        return Date.now;
    })();

const microtaskPromise = Promise.resolve();

function microtask(fn: () => void): void {
    microtaskPromise.then(fn);
}

export {
    now,
    microtask
};
