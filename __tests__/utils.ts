import { now } from '../src/utils';

function* emptyGenerator(): Iterator<void> {
    yield;
}

function sleep(ms: number): void {
    const startTime = now();

    while(now() - startTime < ms) {}
}

export {
    emptyGenerator,
    sleep
};
