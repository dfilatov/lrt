# Chf
[![Build Status](https://img.shields.io/travis/dfilatov/chf/master.svg?style=flat-square)](https://travis-ci.org/dfilatov/chf/branches)
[![NPM Version](https://img.shields.io/npm/v/chf.svg?style=flat-square)](https://www.npmjs.com/package/chf)

Chf is a minimal library for "chunkifying" long-running tasks. The main idea is to split such long-running task into small units of work joined into chunks with limited budget of execution time.

## Example
```ts
import chunkify from 'chf';

const task = chunkify({
    // define unit of work
    unit: function unit(prevResult: number = 0) {
        const result = prevResult + 1;
        
        return {            
            next: result < 10? unit : null,
            result
        };
    }, 
    
    // all units will be joined into chunks with budget limited to 20ms
    budget: 20
});

// You can wait until task has completed
task.promise.then(
    result => {
        console.log(result);
    },
    err => {
        console.error(err);
    });

// You can abort task at any time, next chunk of units won't be executed
setTimeout(task.abort, 50);

```
