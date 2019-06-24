# LRT
[![Build Status](https://img.shields.io/travis/dfilatov/lrt/master.svg?style=flat-square)](https://travis-ci.org/dfilatov/lrt/branches)
[![NPM Version](https://img.shields.io/npm/v/lrt.svg?style=flat-square)](https://www.npmjs.com/package/lrt)

LRT (stands for Long-running task) is a minimal library for "chunkifying" long-running tasks (with ability to abort outdated tasks) and coordinating their execution with cooperative scheduling. The main idea is to split such long-running tasks into small units of work joined into chunks with limited budget of execution time. Units of works are executed synchronously until budget of current chunk is reached, afterwards thread is unblocked until scheduler executes next chunk and so on until all tasks have been completed.

<img width="1334" alt="LRT" src="https://user-images.githubusercontent.com/67957/60046180-621d6100-96cf-11e9-95f2-259362a473f7.png">

## Table of Contents
  * [Installation](#installation)
  * [Usage](#usage)
  * [API](#api)
    * [Scheduler](#scheduler)
    * [Unit of work](#unit-of-work)
    * [Chunk scheduler](#chunk-scheduler)
  * [Questions and answers](#questions-and-answers)
  * [Example](#example)

## Installation
```
$ npm install lrt
```
**Note**: LRT requires native [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) and [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) so if your environment doesn't support them, you will have to install any suitable polyfills as well.

## Usage
```ts
// with ES6 modules
import { createScheduler } from 'lrt';

// with CommonJS modules
const { createScheduler } = require('lrt');
```

## API

```ts
const scheduler = createScheduler(options);
```
  * `options` (optional)
  * `options.chunkBudget` (optional, default is `10`) an execution budget of chunk in milliseconds
  * `options.chunkScheduler` (optional, default is `'auto'`) a [chunk scheduler](#chunk-scheduler), can be `'auto'`, `'idleCallback'`, `'animationFrame'`, `'immediate'`, `'timeout'` or object representing custom scheduler

Returned `scheduler` has two methods:
  * `const task = runTask(unit)` runs task with a given [unit of work](#unit-of-work) and returns task (promise) resolved or rejected after task has completed or thrown an error respectively
  * `abortTask(task)` aborts task execution as soon as possible (see diagram above)
  
### Scheduler
Scheduler is responsible for tasks running, aborting and coordinating order of execution of their units. It tries to maximize budget utilization of each chunk. If a unit of some task has no time to be executed in the current chunk, it will get higher priority to be executed in the next chunk.
  
### Unit of work
Unit of work is represented with a function doing current part of task and returning an object with the following properties:
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

const scheduler = createScheduler({
    chunkScheduler: customChunkScheduler
});
```

## Questions and answers

**What if unit takes more time than chunk budget?**

More likely this means that chunk budget is too small or you need to split your tasks into smaller units. Anyway LRT guarantees  at least one of units of some task will be executed within each chunk. 

**Why not just move long-running task into Web Worker?**

Despite the fact that Web Workers are very useful, they do have a cost: time to instantiate/terminate workers, message latency on large workloads, need for coordination between threads, lack of access the DOM. Nevertheless, you can use LRT inside Web Worker and get the best of both worlds: do not affect main thread and have ability to abort outdated tasks.

## Example
```ts
import { createScheduler } from 'lrt';

// Create scheduler
const scheduler = createScheduler();

// Imitate a part of some long-running task taking 80ms in the whole
function doPartOfTask1(i) {
    const startTime = Date.now();

    while(Date.now() - startTime < 8) {}

    return i + 1;
}

// Imitate a part of another long-running task taking 100ms in the whole
function doPartOfTask2(i) {
    const startTime = Date.now();

    while(Date.now() - startTime < 5) {}

    return i + 1;
}

// Run both tasks concurrenly
const task1 = scheduler.runTask(function unit1(prevResult = 0) {
    const result = doPartOfTask1(prevResult);

    return {
        next: result < 10 ? unit1 : null, // 10 units will be executed
        result
    };
});

const task2 = scheduler.runTask(function unit2(prevResult = 0) {
    const result = doPartOfTask2(prevResult);

    return {
        next: result < 20 ? unit2 : null, // 20 units will be executed
        result
    };
});

// Wait until first task has been completed
task1.then(
    result => {
        console.log(result); // prints "10"
    },
    err => {
        console.error(err);
    });

// Abort second task in 50 ms, it won't be completed
setTimeout(() => scheduler.abortTask(task2), 50);
```
