# xstate-plantuml

Visualize a [xstate](https://github.com/davidkpiano/xstate) or [react-automata](https://github.com/MicheleBertoli/react-automata) statechart as a [plantuml](https://github.com/plantuml/plantuml) state diagram.

## Installation

```
npm install xstate-plantuml
```

## Usage

import xstate-plantuml and call it's default export using a xstate config or machine

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

visualize(config);
```

Which returns a string containing the following plantuml source

```plantuml
@startuml
left to right direction
state "light" as light {
  [*] --> light.green

  state "green" as light.green {
    light.green --> light.red : TIMER
  }

  state "red" as light.red {
    light.red --> light.green : TIMER
  }
}
@enduml
```

Which you can compile to the following image

![usage](examples/usage.png)

## Examples

### Hierarchical state

- [json](./examples/alarm.json)
- [puml](./examples/alarm.puml)

![alarm](./examples/alarm.png)

### Parallel state

- [json](./examples/parallel.json)
- [puml](./examples/parallel.puml)

![parallel](./examples/parallel.png)

## History state

- [json](./examples/bank.json)
- [puml](./examples/bank.puml)

![bank](./examples/bank.png)
