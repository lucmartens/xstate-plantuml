const _ = require('lodash/fp');

const state = (prefix, states) =>
  _.reduce(
    (acc, [k, v]) => [...acc, ['state', [k, `${prefix}_${k}`]]],
    [],
    _.toPairs(states)
  );

const events = (prefix, { states, initial }) =>
  _.reduce(
    (acc, [from, v]) => [
      ...acc,
      ..._.map(
        ([event, target]) => [
          'event',
          [`${prefix}_${from}`, `${prefix}_${target}`, event]
        ],
        _.toPairs(v.on)
      )
    ],
    [],
    _.toPairs(states)
  );

const mach = xstate => [
  'machine',
  { key: xstate.key },
  ...state(xstate.key, xstate.states),
  ...events(xstate.key, xstate)
];

const root = xstate => {
  if (!xstate.parallel) {
    return ['root', {}, mach(xstate)];
  }

  const machines = _.map(
    ([key, machine]) => ({ ...machine, key }),
    _.toPairs(xstate.states)
  );

  console.log(machines);
  return ['root', {}, ..._.map(mach, machines)];
};

module.exports.default = root;
