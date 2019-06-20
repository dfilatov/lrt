# Chf
[![Build Status](https://img.shields.io/travis/dfilatov/chf/master.svg?style=flat-square)](https://travis-ci.org/dfilatov/chf/branches)
[![NPM Version](https://img.shields.io/npm/v/chf.svg?style=flat-square)](https://www.npmjs.com/package/chf)

Chf is a minimal library for "chunkifying" long-running tasks with ability to be aborted. The main idea is to split such long-running task into small units of work joined into chunks with limited budget of execution time.

## Installation
```
$ npm install chf
```
Note: Chf requires native `Promise` api so if your environment doesn't support them, you will have to install any suitable polyfill as well.

## Usage
```ts
// with ES6 modules
import { createTask } from 'chf';

// with CommonJS modules
const { createTask } = require('chf');
```

## Example
```ts
import { createTask } from 'chf';

const task = createTask({
    // Define unit of work
    unit: function unit(prevResult: number = 0) {
        const result = prevResult + 1;
        
        return {            
            next: result < 10? unit : null,
            result
        };
    }, 
    
    // All units will be joined into chunks with execution budget limited to 20ms
    budget: 20
});

// Run task
const promise = task.run();

// Wait until task has completed
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
