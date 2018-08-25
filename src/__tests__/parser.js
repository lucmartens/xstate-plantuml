const parser = require('../parser');

describe('parse state', () => {
  test('none', () => {
    const config = { states: {} };
    expect(parser.state('pre', config)).toEqual([]);
  });

  test('single', () => {
    const config = { states: { x: {} } };
    expect(parser.state('pre', config)).toEqual([['state', ['x', 'pre_x']]]);
  });

  test('multiple', () => {
    const config = { states: { x: {}, y: {} } };
    expect(parser.state('pre', config)).toEqual([
      ['state', ['x', 'pre_x']],
      ['state', ['y', 'pre_y']]
    ]);
  });
});

describe('parse events', () => {
  test('none', () => {
    const config = { states: {} };
    expect(parser.events('pre', config)).toEqual([]);
  });

  test('string', () => {
    const config = { states: { x: { on: { EV: 'y' } } } };
    expect(parser.events('pre', config)).toEqual([
      ['event', ['pre_x', 'pre_y', 'EV']]
    ]);
  });

  test('object', () => {
    const config = { states: { x: { on: { EV: { y: {} } } } } };
    expect(parser.events('pre', config)).toEqual([
      ['event', ['pre_x', 'pre_y', 'EV']]
    ]);
  });

  test('array', () => {
    const config = { states: { x: { on: { EV: [{ target: 'y' }] } } } };
    expect(parser.events('pre', config)).toEqual([
      ['event', ['pre_x', 'pre_y', 'EV']]
    ]);
  });

  test('initial', () => {
    const config = { initial: 'x', states: { x: {} } };
    expect(parser.events('pre', config)).toEqual([['event', ['[*]', 'pre_x']]]);
  });
});

describe('root', () => {
  test('simple machine', () => {
    const config = {
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

    expect(parser.root(config)).toMatchSnapshot();
  });

  test('parallel machine', () => {
    const config = {
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

    expect(parser.root(config)).toMatchSnapshot();
  });
});
