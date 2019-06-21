# LRT
[![Build Status](https://img.shields.io/travis/dfilatov/lrt/master.svg?style=flat-square)](https://travis-ci.org/dfilatov/lrt/branches)
[![NPM Version](https://img.shields.io/npm/v/lrt.svg?style=flat-square)](https://www.npmjs.com/package/lrt)

LRT (Long Running Task) is a minimal library for "chunkifying" long-running tasks with ability to be aborted.
The main idea is to split such long-running task into small units of work joined into chunks with limited budget of execution time.

<img width="1158" alt="LRT" src="https://user-images.githubusercontent.com/67957/59919291-b6a2b100-942f-11e9-96c1-20f330d53f67.png">


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
  * `options.chunkScheduler` (optional, default is `'auto'`) a chunk scheduler, can be `'auto'`, `'idleCallback'`, `'animationFrame'`, `'immediate'`, `'timeout'` or object representing custom scheduler

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

## Example
```ts
import { createTask } from 'lrt';

// Define unit of work
const unit = (prevResult = 0) => {
    const result = prevResult + 1;

    // Return "next" unit and "result" until job is done
    return {
        next: result < 10? unit : null,
        result
    };
};

// Create task
const task = createTask({
    unit,

    // All units will be joined into chunks with execution budget limited to 10ms
    chunkBudget: 10
});

// Run task
const promise = task.run();

// Wait until task has been completed
promise.then(
    result => {
        console.log(result);
    },
    err => {
        console.error(err);
    });

// Abort task at any time, next chunk of units won't be executed
setTimeout(task.abort, 50);
```
