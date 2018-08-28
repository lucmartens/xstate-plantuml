const xstate = require('xstate');
const Buffer = require('./buffer');

const isStateNode = machine =>
  machine.constructor.name === 'StateNode';

const getNode = (stateNode, path) =>
  path.split('.').reduce((acc, k) => acc.states[k], stateNode);

const resolvePath = (stateNode, path) =>
  path[0] === '#' ? path.substr(1) : getNode(stateNode, path).id;

/**
 * Write `stateNode` events to `buffer`.
 *
 * An event is a constant string that initiates a transition
 * between states. An `event` originates from state `from` and
 * causes the machine to transition to state `to`.
 *
 * In plantuml, this is represented as `from --> to : event`.
 * the initial event is represented as `[*] --> to`.
 */
const events = (stateNode, buffer) => {
  if (stateNode.initial) {
    const to = resolvePath(stateNode, stateNode.initial);
    buffer.appendf`[*] --> ${to}`;
    buffer.newline();
  }

  for (const [ev, targets] of Object.entries(stateNode.on)) {
    for (const { target } of targets) {
      const to = resolvePath(stateNode.parent, target[0]);
      buffer.appendf`${stateNode.id} --> ${to} : ${ev}`;
    }
  }
};

/**
 * Write `stateNode` actions to `buffer`.
 */
const actions = (stateNode, buffer) => {
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
 * Write `stateNode` to buffer.
 */
const state = (stateNode, buffer) => {
  buffer.appendf`state "${stateNode.key}" as ${stateNode.id} {`;
  buffer.indent();

  actions(stateNode, buffer);
  events(stateNode, buffer);
  states(stateNode, buffer);

  buffer.outdent();
  buffer.append(`}`);
};

const options = (opts, buffer) => {
  if (opts.leftToRight) {
    buffer.append('left to right direction');
  }
};

const defaultOpts = {
  leftToRight: true
};

const convert = (machine, opts = defaultOpts) => {
  const buffer = new Buffer();
  const stateNode = isStateNode(machine)
    ? machine
    : xstate.Machine(machine);

  buffer.append('@startuml');
  options(opts, buffer);
  state(stateNode, buffer);
  buffer.append('@enduml');

  return buffer.value;
};

module.exports = convert;
