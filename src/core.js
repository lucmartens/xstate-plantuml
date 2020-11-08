const Buffer = require('./buffer');

/** @typedef {import('xstate').MachineConfig} MachineConfig */
/** @typedef {import('xstate').StateMachine} StateMachine */
/** @typedef {import('xstate').StateNode} StateNode */
/** @typedef {import('xstate').StateNodesConfig<any, any, any>} StateNodesConfig */
/** @typedef {import('xstate').StateSchema} StateSchema */

/**
 * @typedef {object} VisualizeOptions
 * @property {boolean} [leftToRight=true]
 * @property {string[]} [skinParams=[]]
 * @property {*} [xstate]
 */

/**
 * Type guard to check for StateNode
 *
 * @param machine {StateNode | object}
 * @returns {boolean} whether machine is StateNode
 */
const isStateNode = machine => machine.constructor.name === 'StateNode';

const resolvePath = (stateNode, path) =>
  typeof path === 'object' ? 
    path.id : 
    path[0] === '#'
      ? stateNode.getStateNodeById(path).id
      : stateNode.getStateNodeByPath(path).id;

/**
 *
 * @param acc {StateSchema[]}
 * @param current {[string, StateSchema[]]}
 * @returns {StateSchema[]}
 */
const reduceTransition = (acc, [event, v]) => {
    if (event === '') {
      // the deprecated "null event" can and should now be notated as `always`
      // so we fix it here:
      event = 'always'
    }
    if (v.length === 1) {
      return /** @type {StateSchema[]} */([...acc, {...v[0], event}])
    } else {
      return /** @type {StateSchema[]} */([...acc, ...v.map((it, i) => ({...v[i], event }))])
    }
  }

/**
 *
 * @param stateNode {StateNodesConfig}
 * @returns {StateSchema[]}
 */
const iterateTransitions = stateNode => {
  if(!stateNode) {
    return []
  } else {
    return Object.entries(stateNode.on).reduce(reduceTransition, [])
  }
}

const normalizeArray = array => {
  if (!array) {
    return [];
  }
  return Array.isArray(array) ? array : [array];
};

const normalizeStringArray = array =>
  normalizeArray(array).map(e => (typeof e === 'string' ? e : e.name || e.type));


const transitionGuards = cond => {
  cond = normalizeStringArray(cond);
  return cond.length ? `\\l[${cond.join(',')}]` : '';
};

const transitionActions = actions => {
  actions = normalizeStringArray(actions);
  return actions.length ? `\\l/${actions.join(',')}` : '';
};

/**
 * @param stateNode {StateNodesConfig}
 * @param buffer {Buffer}
 */
const transitions = (stateNode, buffer) => {
  /**
   * `cond` might come from xstate@v3, while `guards` come from v4
   * @param transition {StateSchema | *}
   */
  const transition = ({ event, target, guards: _guards, cond = _guards, actions}) => {
    const from = stateNode.id;
    // some events only trigger actions and don't cause a transition.
    const to = target ? resolvePath(stateNode.parent || stateNode, target[0]) : from;
    const guards = transitionGuards(cond);
    actions = transitionActions(actions);
    if (from === to) {
      // let's omit the target in this case since it can become very verbose in the diagrams
      // @ts-ignore TS2339: Property 'appendf' does not exist on type 'Buffer'.
      buffer.appendf`${from} : ${event}${guards}${actions}`;
    } else {
      // @ts-ignore TS2339: Property 'appendf' does not exist on type 'Buffer'.
      buffer.appendf`${from} --> ${to} : ${event}${guards}${actions}`;
    }
  };

  if (stateNode.initial) {
    const to = resolvePath(stateNode, stateNode.initial);
    // @ts-ignore TS2339: Property 'appendf' does not exist on type 'Buffer'.
    buffer.appendf`[*] --> ${to}`;
    // @ts-ignore TS2339: Property 'newline' does not exist on type 'Buffer'.
    buffer.newline();
  }

  iterateTransitions(stateNode).forEach(transition);
};

const activities = (stateNode, buffer) => {
  normalizeArray(stateNode.activities).forEach(
    activity => {
      if (typeof activity === 'object' && activity.type) {
        switch (activity.type) {
          case 'xstate.invoke':
            buffer.appendf`${stateNode.id} : invoke/${activity.id}`;
            break;
          default:
            buffer.appendf`${stateNode.id} : do/type:${activity.type}`;
        }
      } else {
        buffer.appendf`${stateNode.id} : do/${activity}`;
      }
    }
  )
};

const internalActions = (stateNode, buffer) => {
  if (stateNode.onEntry) {
    normalizeStringArray(stateNode.onEntry).forEach(
      (action) => {
        buffer.appendf`${stateNode.id} : onEntry/${action}`
      }
    )
  }

  if (stateNode.onExit) {
    normalizeStringArray(stateNode.onExit).forEach(
      (action) => {
        buffer.appendf`${stateNode.id} : onExit/${action}`
      }
    )
  }
};

const states = (stateNode, buffer) => {
  const values = /** @type {StateNode[]} */(Object.values(stateNode.states));
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

/**
 * @type {VisualizeOptions}
 */
const defaultOptions = {
  leftToRight: true,
  skinParams: [],
};

/**
 * Returns the plantuml syntax for the state machine.
 *
 * @param machine {MachineConfig | StateMachine | StateNode}
 * Either the return value of `xstate.Machine` function or it's first argument.
 * In the second case, `options.xstate` or, if not set `require('xstate')`,
 * is used to create the StateMachine (extends StateNode) instance.
 *
 * @param options {VisualizeOptions}
 * @returns {string}
 */
const visualize = (machine, options = {}) => {
  options = { ...defaultOptions, ...options };

  const buffer = new Buffer();
  const stateNode = isStateNode(machine)
    ? machine
    : (options.xstate || require('xstate')).Machine(machine);

  buffer.append('@startuml');
  commands(options, buffer);
  state(stateNode, buffer);
  buffer.append('@enduml');

  return buffer.value;
};

module.exports = visualize;
