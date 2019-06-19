const now: () => number = typeof performance === 'object' && typeof performance.now === 'function'?
    () => performance.now() :
    () => Date.now();

export {
    now
};
