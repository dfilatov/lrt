import chunkify from '../src/chunkify';

test('should fulfill promise with result after job has done', done => {
    chunkify({
        unit: function unit(i: number = 1) {
            sleep(10);

            return {
                next: i < 9? unit : null,
                result: i + 1
            };
        }
    }).promise.then(result => {
        expect(result).toBe(10);
        done();
    });
});

test('should reject promise if unit throws exception', done => {
    const err = new Error();

    chunkify({
        unit: function unit(i: number = 1) {
            sleep(10);

            if(i > 5) {
                throw err;
            }

            return {
                next: unit,
                result: i + 1
            };
        }
    }).promise.catch(_err => {
        expect(_err).toBe(err);
        done();
    });
});

function sleep(ms: number): void {
    const startTime = Date.now();

    while(Date.now() - startTime < ms) {}
}
