const _ = require('lodash/fp');

const state = (prefix, { states }) =>
  _.reduce(
    (acc, [k, v]) => [...acc, ['state', [k, `${prefix}_${k}`]]],
    [],
    _.toPairs(states)
  );

const events = (prefix, { states, initial }) => {
  const event = from => ([ev, target]) => {
    if (_.isString(target)) {
      return ['event', [`${prefix}_${from}`, `${prefix}_${target}`, ev]];
    }

    if (_.isArray(target)) {
      const name = _.get('0.target', target);
      return ['event', [`${prefix}_${from}`, `${prefix}_${name}`, ev]];
    }

    if (_.isObject(target)) {
      const name = _.keys(target)[0];
      return ['event', [`${prefix}_${from}`, `${prefix}_${name}`, ev]];
    }
  };

  const initialEvents = initial
    ? [['event', ['[*]', `${prefix}_${initial}`]]]
    : [];

  return _.reduce(
    (acc, [from, v]) => [...acc, ..._.map(event(from), _.toPairs(v.on))],
    initialEvents,
    _.toPairs(states)
  );
};

const machine = xstate => [
  'machine',
  { key: xstate.key },
  ...state(xstate.key, xstate),
  ...events(xstate.key, xstate)
];

const root = xstate => {
  if (!xstate.parallel) {
    return ['root', {}, machine(xstate)];
  }

  const machines = _.map(
    ([key, config]) => ({ ...config, key }),
    _.toPairs(xstate.states)
  );

  return ['root', {}, ..._.map(machine, machines)];
};

module.exports = {
  state,
  events,
  machine,
  root
};
