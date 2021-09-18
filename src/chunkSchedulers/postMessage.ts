import { ChunkScheduler } from './types';

const postMessageScheduler: ChunkScheduler<void> | null =
    typeof window === 'undefined' ?
        null :
        (() => {
            const msg = '__lrt__' + Math.random();
            let fns: (() => void)[] = [];

            window.addEventListener(
                'message',
                e => {
                    if(e.data === msg) {
                        const fnsToCall = fns;

                        fns = [];

                        for(let i = 0; i < fnsToCall.length; i++) {
                            fnsToCall[i]();
                        }
                    }
                },
                true
            );

            return {
                request: (fn: () => void) => {
                    fns.push(fn);

                    if(fns.length === 1) {
                        window.postMessage(msg, '*');
                    }
                }
            };
        })();

export {
    postMessageScheduler
};
