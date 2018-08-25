# xstate-plantuml

Convert a [xstate](https://github.com/davidkpiano/xstate) or [react-automata](https://github.com/MicheleBertoli/react-automata) statechart to a [plantuml](http://plantuml.com/state-diagram) state diagram

## Installation
```
npm install xstate-plantuml
```

## Usage

```js
import convert from 'xstate-plantuml';

const config = {
  key: 'light',
  initial: 'green',
  states: {
    green: {
      on: {
        TIMER: 'yellow'
      }
    },
    yellow: {
      on: {
        TIMER: 'red'
      }
    },
    red: {
      on: {
        TIMER: 'green'
      }
    }
  }
};

console.log(convert(config));
```

## Supports

- [x] Single machine
- [x] Parallel machine
- [x] Hierarchical machine
- [ ] History machine
- [x] Initial event
- [x] Internal string events `{on: {x: '.y'}}`
- [x] Internal obj events `{on {x: {target: 'y'}}}`
- [x] String event `{on: {x: 'y'}}`
- [x] Object event `{on: {x: {y: {}}}}`
- [x] Array event `{on: {x: [{target: 'y'}]}}`
- [x] String action `fetch`
- [ ] Object action `{ type: 'fetch'}`
- [ ] Function action
- [x] `onEntry` actions
- [x] `onExit` actions
- [ ] `transition` actions
