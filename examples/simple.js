const fs = require('fs');
const convert = require('../src/index').default;

const lightMachine = {
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

fs.writeFileSync('examples/simple.puml', convert(lightMachine));
