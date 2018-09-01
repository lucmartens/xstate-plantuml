const xstate = require('xstate');
const Buffer = require('./buffer');

const isStateNode = machine => machine.constructor.name === 'StateNode';

const resolvePath = (stateNode, path) =>
  path[0] === '#'
    ? stateNode.getStateNodeById(path).id
    : stateNode.getStateNodeByPath(path).id;

const iterateTransitions = stateNode =>
  stateNode
    ? Object.entries(stateNode.on).map(([event, v]) => ({ event, ...v[0] }))
    : [];

const normalizeStringArray = array => {
  if (!array || !array.length) {
    return [];
  }

  array = Array.isArray(array) ? array : [array];
  return array.map(e => (typeof e === 'string' ? e : e.name));
};

const transitionGuards = cond => {
  cond = normalizeStringArray(cond);
  return cond.length ? `\\l[${cond.join(',')}]` : '';
};

const transitionActions = actions => {
  actions = normalizeStringArray(actions);
  return actions.length ? `\\l/${actions.join(',')}` : '';
};

const transitions = (stateNode, buffer) => {
  const transition = ({ event, target, cond, actions }) => {
    const from = stateNode.id;
    const to = resolvePath(stateNode.parent || stateNode, target[0]);
    const guards = transitionGuards(cond);
    actions = transitionActions(actions);
    buffer.appendf`${from} --> ${to} : ${event}${guards}${actions}`;
  };

  if (stateNode.initial) {
    const to = resolvePath(stateNode, stateNode.initial);
    buffer.appendf`[*] --> ${to}`;
    buffer.newline();
  }

  iterateTransitions(stateNode).forEach(transition);
};

const activities = (stateNode, buffer) => {
  normalizeStringArray(stateNode.activities).forEach(
    activity => buffer.appendf`${stateNode.id} : do/${activity}`
  );
};

const internalActions = (stateNode, buffer) => {
  for (const action of stateNode.onEntry) {
    buffer.appendf`${stateNode.id} : onEntry/${action}`;
  }

  for (const action of stateNode.onExit) {
    buffer.appendf`${stateNode.id} : onExit/${action}`;
  }
};

const states = (stateNode, buffer) => {
  const values = Object.values(stateNode.states);
  for (const [index, child] of values.entries()) {
    state(child, buffer);

    if (index < values.length - 1) {
      buffer.newline();
    }
  }
};

const state = (stateNode, buffer) => {
  buffer.appendf`state "${stateNode.key}" as ${stateNode.id} {`;
  buffer.indent();

  internalActions(stateNode, buffer);
  activities(stateNode, buffer);
  transitions(stateNode, buffer);
  states(stateNode, buffer);

  buffer.dedent();
  buffer.append(`}`);
};

const commands = (options, buffer) => {
  if (options.leftToRight) {
    buffer.append('left to right direction');
  }

  for (const skinParam of options.skinParams) {
    buffer.append(`skinparam ${skinParam}`);
  }
};

const defaultOptions = {
  leftToRight: true,
  skinParams: []
};

const visualize = (machine, options = {}) => {
  options = { ...defaultOptions, ...options };

  const buffer = new Buffer();
  const stateNode = isStateNode(machine) ? machine : xstate.Machine(machine);

  buffer.append('@startuml');
  commands(options, buffer);
  state(stateNode, buffer);
  buffer.append('@enduml');

  return buffer.value;
};

module.exports = visualize;
