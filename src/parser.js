const _ = require('lodash/fp');

const combinations = (collA, collB) =>
  _.flatMap(a => _.map(b => [a, b], collB), collA);

const state = (prefix, { states }) =>
  _.reduce(
    (acc, [k, v]) => [...acc, ['state', [k, `${prefix}_${k}`]]],
    [],
    _.toPairs(states)
  );

const events = (prefix, config) => {
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

  let ast = config.initial
    ? [['event', ['[*]', `${prefix}_${config.initial}`]]]
    : [];

  ast = _.reduce(
    (acc, [from, v]) => [...acc, ..._.map(event(from), _.toPairs(v.on))],
    ast,
    _.toPairs(config.states)
  );

  if (config.on) {
    ast = _.reduce(
      (acc, [[from], [ev, target]]) => {
        const x = target[0] === '.' ? target.substr(1) : target;
        return [...acc, event(from)([ev, x])];
      },
      ast,
      combinations(_.toPairs(config.states), _.toPairs(config.on))
    );
  }

  return ast;
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
