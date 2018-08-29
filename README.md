# xstate-plantuml

[![npm](https://img.shields.io/npm/v/xstate-plantuml.svg?style=flat-square)](https://www.npmjs.com/package/xstate-plantuml)
[![Travis](https://img.shields.io/travis/lucmartens/xstate-plantuml.svg?style=flat-square)](https://travis-ci.org/lucmartens/xstate-plantuml/)

Visualize a [xstate](https://github.com/davidkpiano/xstate) or [react-automata](https://github.com/MicheleBertoli/react-automata) statechart as a [plantuml](https://github.com/plantuml/plantuml) state diagram.

## Installation

```
npm install xstate-plantuml
```

## Usage

import `xstate-plantuml` and call it's default export using a xstate config or machine

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

![usage](examples/usage.svg)

## Examples

### Hierarchical state

- [json](./examples/alarm.json)
- [puml](./examples/alarm.puml)

![alarm](./examples/alarm.svg)

### Parallel state

- [json](./examples/text-editor.json)
- [puml](./examples/text-editor.puml)

![text-editor](./examples/text-editor.svg)

## History state

- [json](./examples/payment.json)
- [puml](./examples/payment.puml)

![payment](./examples/payment.svg)

## Guards and actions

- [json](./examples/download.json)
- [puml](./examples/download.puml)

![download](./examples/download.svg)
