# xstate-plantuml

Visualize a [xstate](https://github.com/davidkpiano/xstate) or [react-automata](https://github.com/MicheleBertoli/react-automata) statechart as a [plantuml](https://github.com/plantuml/plantuml) state diagram.

This fork was created to add improved support for xstate@v4 and is currently installable by adding the following to package.json:
```json
  "@karfau/xstate-plantuml": "github:karfau/xstate-plantuml#{TAG OR HASH}"
```

#### [Try online](https://codesandbox.io/s/43yj22oy20?module=%2Fsrc%2Fmachine.json)


## Installation

```json
  "@karfau/xstate-plantuml": "github:karfau/xstate-plantuml#{TAG OR HASH}"
```
([xstate](https://github.com/davidkpiano/xstate) is a peer dependency, if you don't have it insalled you need to run `npm install xstate`)

<!--
```
npm install @karfau/xstate-plantuml
```
-->

## Usage

import `@karfau/xstate-plantuml` and call it's default export using a xstate config or machine

```js
import visualize from '@karfau/xstate-plantuml';

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

Which you can render to the following image

![usage](examples/usage.svg?sanitize=true)

## Options

In addition to a state machine, `visualize` accepts an options map

| option      | default | description                                                       |
| ----------- | ------- | ----------------------------------------------------------------- |
| leftToRight | true    | whether to render left to right or top to bottom                  |
| skinParams  | []      | Additional [skinparams](http://plantuml.com/skinparam) to include |
| xstate      | xstate (resolved module with that name) | to pass alternative implementaitons ([e.g. for testing](https://github.com/karfau/xstate-plantuml/blob/develop/src/__tests__/core.js)) |

Our previous example with different options

```js
visualize(config, {
  leftToRight: false,
  skinParams: ['monochrome true']
});
```

```plantuml
@startuml
skinparam monochrome true

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

compiles to

![options](examples/options.svg?sanitize=true)

## Examples

Not all examples are listed here, please check [examples](https://github.com/karfau/xstate-plantuml/tree/develop/examples) for more

### Hierarchical state

- [json](./examples/alarm.json)
- [puml](./examples/alarm.puml)

![alarm](./examples/alarm.svg?sanitize=true)

### Parallel state

- [json](./examples/text-editor.json)
- [puml](./examples/text-editor.puml)

![text-editor](./examples/text-editor.svg?sanitize=true)

### History state

- [json](./examples/payment.json)
- [puml](./examples/payment.puml)

![payment](./examples/payment.svg?sanitize=true)

### Internal transitions

- [json](./examples/word.json)
- [puml](./examples/word.puml)

![word](./examples/word.svg?sanitize=true)

### Guards, actions and activities

#### xstate@v3:
- [json](./examples/download.json)
- [puml](./examples/download.puml)

![download](./examples/download.svg?sanitize=true)

#### xstate@v4:
- [json](./examples/invoke.json)
- [puml](./examples/invoke.puml)

![download](./examples/invoke.svg?sanitize=true)
