# xstate-plantuml

Visualize a [xstate](https://github.com/davidkpiano/xstate) or [react-automata](https://github.com/MicheleBertoli/react-automata) statechart as a [plantuml](http://plantuml.com/state-diagram) state diagram

## Installation

```
npm install xstate-plantuml
```

## Usage

```js
import visualize from 'xstate-plantuml';

const config = {
  key: 'light',
  initial: 'green',
  states: {
    green: {
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

visualize(config, options);
```

## Examples

### Hierarchical machine

- [json](./examples/alarm.json)
- [puml](./examples/alarm.puml)

![alarm](./examples/alarm.png)

### Parallel machine

- [json](./examples/parallel.json)
- [puml](./examples/parallel.puml)

![parallel](./examples/parallel.png)

## History machine

- [json](./examples/bank.json)
- [puml](./examples/bank.puml)

![bank](./examples/bank.png)
