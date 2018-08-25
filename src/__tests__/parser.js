const parse = require('../parser').default;

describe('parser', () => {
  test('simple machine', () => {
    const machine = {
      key: 'users-crud',
      initial: 'on',
      states: {
        on: {
          on: {
            TOGGLE: 'off'
          }
        },
        off: {
          on: {
            TOGGLE: 'on'
          }
        }
      }
    };

    expect(parse(machine)).toMatchSnapshot();
  });

  test('parallel machine', () => {
    const machine = {
      key: 'users-crud',
      parallel: true,
      states: {
        light: {
          initial: 'on',
          states: {
            on: {
              on: {
                TOGGLE: 'off'
              }
            },
            off: {
              on: {
                TOGGLE: 'on'
              }
            }
          }
        }
      }
    };

    expect(parse(machine)).toMatchSnapshot();
  });
});
