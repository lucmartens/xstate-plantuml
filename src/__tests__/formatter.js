const format = require('../formatter').default;

const machine = [
  'machine',
  { key: 'users-crud' },
  ['state', ['on', 'users-crud_on']],
  ['state', ['off', 'users-crud_off']],
  ['event', ['[*]', 'users-crud_on']],
  ['event', ['users-crud_on', 'users-crud_off', 'TOGGLE']],
  ['event', ['users-crud_off', 'users-crud_on', 'TOGGLE']]
];

describe('formatter', () => {
  test('simple machine', () => {
    expect(format(['root', {}, machine])).toMatchSnapshot();
  });

  test('nested machine', () => {
    expect(format(['root', {}, [...machine, machine]])).toMatchSnapshot();
  });
});
