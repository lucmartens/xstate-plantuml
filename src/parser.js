const _ = require('lodash/fp');

const combinations = (collA, collB) =>
  _.flatMap(a => _.map(b => [a, b], collB), collA);

const iterateEvents = (fn, config) => {
  let ast = _.flatMap(
    ([from, v]) =>
      _.map(([ev, target]) => fn(from, target, ev), _.toPairs(v.on)),
    _.toPairs(config.states)
  );

  if (config.on) {
    ast = _.concat(
      ast,
      _.compact(
        _.map(([[from], [ev, target]]) => {
          if (_.isObject(target) && target.internal) {
            return fn(from, target.target, ev);
          }

          if (_.isString(target) && target[0] === '.') {
            return fn(from, target.substr(1), ev);
          }
        }, combinations(_.toPairs(config.states), _.toPairs(config.on)))
      )
    );
  }

  return ast;
};

const state = (prefix, { states }) =>
  _.reduce(
    (acc, [k, v]) => {
      if (v.states) {
        return acc;
      }

      return [...acc, ['state', [k, `${prefix}_${k}`]]];
    },
    [],
    _.toPairs(states)
  );

const actions = (prefix, config) => {
  ast = _.flatMap(
    ([k, v]) =>
      _.map(key => (v[key] ? ['action', [config.key, key, v[key]]] : null), [
        'onEntry',
        'onExit'
      ]),
    _.toPairs(config.states)
  );

  return _.compact(ast);
};

const event = prefix => (from, target, ev) => {
  let targetName;

  if (_.isString(target)) {
    targetName = target;
  } else if (_.isArray(target)) {
    targetName = _.get('0.target', target);
  } else if (_.isObject(target) && !target.internal) {
    targetName = _.keys(target)[0];
  } else if (_.isObject(target) && !!target.internal) {
    targetName = target.target;
  }
  return ['event', [`${prefix}_${from}`, `${prefix}_${targetName}`, ev]];
};

const events = (prefix, config) => {
  let ast = config.initial
    ? [['event', ['[*]', `${prefix}_${config.initial}`]]]
    : [];

  ast = _.concat(ast, iterateEvents(event(prefix), config));
  return ast;
};

const submachine = (prefix, config) => {
  return _.compact(
    _.map(([name, target]) => {
      if (_.isObject(target) && target.states) {
        return machine(`${prefix}_${name}`, name, target);
      }
    }, _.toPairs(config.states))
  );
};

const machine = (key, name, xstate) => [
  'machine',
  { key, name },
  ...actions(name, xstate),
  ...state(name, xstate),
  ...events(name, xstate),
  ...submachine(name, xstate)
];

const root = xstate => {
  if (!xstate.parallel) {
    return ['root', {}, machine(xstate.key, xstate.key, xstate)];
  }

  const machines = _.map(
    ([key, config]) => ({ ...config, key }),
    _.toPairs(xstate.states)
  );

  return [
    'root',
    {},
    ..._.map(config => machine(config.key, config.key, config), machines)
  ];
};

module.exports = {
  state,
  events,
  actions,
  machine,
  root
};
