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

const transitionGuards = cond => {
  if (!cond || !cond.length) {
    return '';
  }

  cond = Array.isArray(cond) ? cond : [cond];
  cond = cond.map(c => (typeof c === 'string' ? c : c.name));
  return `\\l[${cond.join(',')}]`;
};

const transitionActions = actions => {
  if (!actions || !actions.length) {
    return '';
  }

  actions = Array.isArray(actions) ? actions : [actions];
  actions = actions.map(a => (typeof a === 'string' ? a : a.name));
  return `\\l/${actions.join(',')}`;
};

const transitions = (stateNode, buffer) => {
  const transition = ({ event, target, cond, actions }) => {
    const from = stateNode.id;
    const to = resolvePath(stateNode.parent, target[0]);
    const guards = transitionGuards(cond);
    actions = transitionActions(actions);
    buffer.appendf`${from} --> ${to} : ${event}${guards}${actions}`;
  };

  if (stateNode.initial) {
    const to = resolvePath(stateNode, stateNode.initial);
    buffer.appendf`[*] --> ${to}`;
    buffer.newline();
  }

  iterateTransitions(stateNode.parent)
    .filter(({ internal }) => internal)
    .forEach(transition);

  iterateTransitions(stateNode)
    .filter(({ internal }) => !internal)
    .forEach(transition);
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
  transitions(stateNode, buffer);
  states(stateNode, buffer);

  buffer.dedent();
  buffer.append(`}`);
};

const commands = (options, buffer) => {
  if (options.leftToRight) {
    buffer.append('left to right direction');
  }
};

const defaultOptions = {
  leftToRight: true
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
