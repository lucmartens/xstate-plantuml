const xstate = require('xstate');
const Buffer = require('./buffer');

const isStateNode = machine =>
  machine.constructor.name === 'StateNode';

const getNode = (stateNode, path) =>
  path.split('.').reduce((acc, k) => acc.states[k], stateNode);

const resolvePath = (stateNode, path) =>
  path[0] === '#' ? path.substr(1) : getNode(stateNode, path).id;

/**
 * Return a string representing `transition` guard clauses
 *
 * Guard clauses are represented as
 *    `[cond1,cond2]`
 */
const transitionGuards = cond => {
  if (!cond || !cond.length) {
    return '';
  }

  cond = Array.isArray(cond) ? cond : [cond];
  cond = cond.map(c => (typeof c === 'string' ? c : c.name));
  return `\\l[${cond.join(',')}]`;
};

/**
 * Return a string representing `transition` actions
 *
 * Transition actions are represented as
 *    `/action1,action2`
 */
const transitionActions = actions => {
  if (!actions || !actions.length) {
    return '';
  }

  actions = Array.isArray(actions) ? actions : [actions];
  actions = actions.map(a => (typeof a === 'string' ? a : a.name));
  return `\\l/${actions.join(',')}`;
};

/**
 * Write `stateNode` transitions to `buffer`.
 *
 * A transition is represented as
 *    `from --> to : event [guards] / actions`.
 *
 * The initial transition is represented as
 *    `[*] --> to`.
 */
const transitions = (stateNode, buffer) => {
  if (stateNode.initial) {
    const to = resolvePath(stateNode, stateNode.initial);
    buffer.appendf`[*] --> ${to}`;
    buffer.newline();
  }

  for (const [event, transition] of Object.entries(stateNode.on)) {
    for (let { target, cond, actions } of transition) {
      const from = stateNode.id;
      const to = resolvePath(stateNode.parent, target[0]);
      const guards = transitionGuards(cond);
      actions = transitionActions(actions);
      buffer.appendf`${from} --> ${to} : ${event}${guards}${actions}`;
    }
  }
};

/**
 * Write `stateNode` actions to `buffer`.
 *
 * A state action is represented as
 *    `my.node : action`
 */
const stateActions = (stateNode, buffer) => {
  for (const action of stateNode.onEntry) {
    buffer.appendf`${stateNode.id} : onEntry/${action}`;
  }

  for (const action of stateNode.onExit) {
    buffer.appendf`${stateNode.id} : onExit/${action}`;
  }
};

/**
 * Write `stateNode` states to `buffer`.
 */
const states = (stateNode, buffer) => {
  const values = Object.values(stateNode.states);

  for (const [index, child] of values.entries()) {
    state(child, buffer);

    if (index < values.length - 1) {
      buffer.newline();
    }
  }
};

/**
 * Write `stateNode` to `buffer`.
 */
const state = (stateNode, buffer) => {
  buffer.appendf`state "${stateNode.key}" as ${stateNode.id} {`;
  buffer.indent();

  stateActions(stateNode, buffer);
  transitions(stateNode, buffer);
  states(stateNode, buffer);

  buffer.dedent();
  buffer.append(`}`);
};

/**
 * Write plantuml commands to `buffer`.
 */
const commands = (options, buffer) => {
  if (options.leftToRight) {
    buffer.append('left to right direction');
  }
};

const defaultOptions = {
  leftToRight: true
};

/**
 * Visualize a xstate config or instantiated machine as a plantuml
 * state diagram.
 */
const visualize = (machine, options = {}) => {
  options = { ...defaultOptions, ...options };

  const buffer = new Buffer();
  const stateNode = isStateNode(machine)
    ? machine
    : xstate.Machine(machine);

  buffer.append('@startuml');
  commands(options, buffer);
  state(stateNode, buffer);
  buffer.append('@enduml');

  return buffer.value;
};

module.exports = visualize;
