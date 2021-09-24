import { now } from '../src/utils';

function* emptyGenerator(): Iterator<void, void> {
    yield;
}

function sleep(ms: number): void {
    const startTime = now();

    while(now() - startTime < ms) {}
}

const simpleGenerator = function*(): Iterator<number, number> {
    let i = 0;

    while(i++ < 9) {
        sleep(10);
        yield i;
    }

    return i;
};

export {
    emptyGenerator,
    simpleGenerator,
    sleep
};
