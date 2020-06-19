const xstate = require('xstate');
const Buffer = require('./buffer');

const isStateNode = machine => machine.constructor.name === 'StateNode';

const resolvePath = (stateNode, path) =>
  typeof path === 'object' ? 
    path.id : 
    path[0] === '#'
      ? stateNode.getStateNodeById(path).id
      : stateNode.getStateNodeByPath(path).id;

const iterateTransitions = stateNode => {
  if(!stateNode) {
    return []
  } else {
    return Object.entries(stateNode.on).reduce((acc,[event, v]) => {
      if (event === '') {
        // the deprecated "null event" can and should now be notated as `always`
        // so we fix it here:
        event = 'always'
      }
      if(v.length === 1) {
        return ([...acc,{ ...v[0], event }])
      } else {
        return ([...acc,...v.map( (it,i) => ({ ...v[i], event }))])
      }
    },[])      
  }
}

const normalizeStringArray = array => {
  if (!array) {
    return [];
  }

  array = Array.isArray(array) ? array : [array];
  return array.map(e => (typeof e === 'string' ? e : e.name || e.type));
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
    // cond might come from v3, while guards come from v4 (?)
  const transition = ({ event, target, guards: _guards, cond = _guards, actions}) => {
    const from = stateNode.id;
    // some events only trigger actions and don't cause a transition.
    const to = target ? resolvePath(stateNode.parent || stateNode, target[0]) : from;
    const guards = transitionGuards(cond);
    actions = transitionActions(actions);
    if (from === to) {
      // let's omit the target in this case since it can become very verbose in the diagrams
      buffer.appendf`${from} : ${event}${guards}${actions}`;
    } else {
      buffer.appendf`${from} --> ${to} : ${event}${guards}${actions}`;
    }
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
  skinParams: [],
  xstate: xstate
};

const visualize = (machine, options = {}) => {
  options = { ...defaultOptions, ...options };

  const buffer = new Buffer();
  const stateNode = isStateNode(machine) ? machine : options.xstate.Machine(machine);

  buffer.append('@startuml');
  commands(options, buffer);
  state(stateNode, buffer);
  buffer.append('@enduml');

  return buffer.value;
};

module.exports = visualize;
