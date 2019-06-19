# Chf
[![Build Status](https://img.shields.io/travis/dfilatov/chf/master.svg?style=flat-square)](https://travis-ci.org/dfilatov/chf/branches)
[![NPM Version](https://img.shields.io/npm/v/chf.svg?style=flat-square)](https://www.npmjs.com/package/chf)

Chf is a minimal library to split long-running tasks into chunks.

## Example
```ts
import chunkify from 'chf';

chunkify({
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
```
