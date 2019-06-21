# LRT
[![Build Status](https://img.shields.io/travis/dfilatov/lrt/master.svg?style=flat-square)](https://travis-ci.org/dfilatov/lrt/branches)
[![NPM Version](https://img.shields.io/npm/v/lrt.svg?style=flat-square)](https://www.npmjs.com/package/lrt)

LRT (stands for Long-running task) is a minimal library for "chunkifying" long-running tasks with ability to be aborted.
The main idea is to split such long-running task into small units of work joined into chunks with limited budget of execution time. Units of works are executed synchronously until budget of current chunk is reached, after that thread is unblocked until scheduler executes next chunk and so on.

<img width="1280" alt="LRT" src="https://user-images.githubusercontent.com/67957/59948554-0bb6e500-9479-11e9-9b5b-dfd8fce3c2dd.png">


## Installation
```
$ npm install lrt
```
Note: LRT requires native `Promise` api so if your environment doesn't support them, you will have to install any suitable polyfill as well.

## Usage
```ts
// with ES6 modules
import { createTask } from 'lrt';

// with CommonJS modules
const { createTask } = require('lrt');
```

## API

```ts
const task = createTask(options);
```
  * `options.unit` (required) a [unit of work](#unit-of-work)
  * `options.chunkBudget` (optional, default is `12`) an execution budget of chunk in milliseconds
  * `options.chunkScheduler` (optional, default is `'auto'`) a [chunk scheduler](#chunk-scheduler), can be `'auto'`, `'idleCallback'`, `'animationFrame'`, `'immediate'`, `'timeout'` or object representing custom scheduler

Returned `task` has only two methods:
  * `task.run()` returns promise resolved or rejected after task has completed or thrown an error respectively
  * `task.abort()` aborts task execution as soon as possible (see diagram above)
  
### Unit of work
"Unit of work" is represented with a function doing current part of task and returning an object with the following properties:
  * `next` (required) pointing to the next unit of work or equal to `null` if the current unit is last and task is completed
  * `result` (optional) result 
  
If the previous unit returns `result`, it will be passed as an argument to the next unit. First unit doesn't obtain this argument and default value can be specified as an initial one.
  
Example:
```ts
const unit = (previousResult = 0) => {
    const result = doCurrentPartOfTask(prevResult);
    
    return {
        next: unit, // or null if task is completed
        result
    };
};
```

### Chunk scheduler
Chunk scheduler is utilized internally to schedule execution of the next chunk of units. By default (without specifying corresponding option) LRT tries to detect the best available option for the current environment. In browsers any of `requestIdleCallback` or `requestAnimationFrame` will be used depending on their availability, or `setImmediate` inside NodeJS. If nothing suitable is available then regular `setTimeout` is used as a fallback. Also you can pass your own implementation of scheduler.

#### Custom chunk scheduler
Custom scheduler should implement two methods:
  * `request(fn)` (required) accepts function `fn` and returns `token` for possible aborting via `clear` method (if it is specified)
  * `cancel(token)` (optional) accepts `token` and cancels scheduling
  
For example, let's implement scheduler which runs next chunk of units in ~100 milliseconds after previous chunk has ended
```ts
const customChunkScheduler = {
    request: fn => setTimeout(fn, 100),
    cancel: token => clearTimeout(token)
};

const task = createTask({
    unit,
    chunkScheduler: customChunkScheduler
});
```

## FAQ

**What if unit takes more time than chunk budget?**

Generally this means that chunk budget is too small or you need to split your task into smaller units. Anyway LRT guarantees within each chunk at least one of units is executed. 

**Why not just move long-running task into Web Worker?**

Moreover, you can use `LRT` inside Web Worker and get the best of both worlds.

## Full example
```ts
import { createTask } from 'lrt';

// Imitate a part of long-running task taking 80ms in the whole
function doPartOfTask(i) {
    const startTime = Date.now();

    while(Date.now() - startTime < 8);

    return i + 1;
}

// Define unit of work
const unit = (prevResult = 0) => {
    const result = doPartOfTask(prevResult);

    return {
        next: result < 10 ? unit : null, // 10 units will be executed
        result
    };
};

// Create task
const task = createTask({ unit });

// Run task
const promise = task.run();

// Wait until task has been completed
promise.then(
    result => {
        console.log(result); //
    },
    err => {
        console.error(err);
    });

// Abort task at any time, next chunk of units won't be executed
setTimeout(task.abort, 50);
```
