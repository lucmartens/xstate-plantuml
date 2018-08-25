const _ = require('lodash/fp');

/**
 * Increase buffer's indentation by one level.
 */
const indent = buffer => _.update('indent', v => v + 1, buffer);

/**
 * Decrease buffer's indentation by one level.
 */
const outdent = buffer => _.update('indent', v => (v > 0 ? v - 1 : v), buffer);

/**
 * Return a string of whitespace equal to the buffer's indentation.
 */
const tabs = buffer => _.repeat(buffer.indent, _.repeat(4, ' '));

/**
 * Append a line to a buffer
 */
const append = (value, buffer) =>
  _.update('value', v => v + tabs(buffer) + value + '\n', buffer);

const root = () => [
  buffer => append('@startuml', buffer),
  buffer => append('@enduml', buffer)
];

const machine = ({ name, key }) => [
  buffer => append(`state "${name}" as ${key} {`, buffer),
  buffer => append('}', buffer)
];

const state = ([name, key]) => [
  buffer => append(`state "${name}" as ${key}`, buffer)
];

const event = ([from, to, ev]) => [
  buffer => append(`${from} --> ${to} ${ev ? `: ${ev}` : ''}`, buffer)
];

const action = ([machine, on, label]) => [
  buffer => append(`${machine} : ${on}/${label}`, buffer)
];

const ops = {
  machine,
  state,
  event,
  action,
  root
};

const format = (ast, buffer) => {
  const [op, args, ...children] = ast;
  const [pre, post] = ops[op](args);

  if (pre) {
    buffer = pre(buffer);
  }

  for (const child of children) {
    buffer = indent(buffer);
    buffer = format(child, buffer);
    buffer = outdent(buffer);
  }

  if (post) {
    buffer = post(buffer);
  }

  return buffer;
};

module.exports.default = ast => format(ast, { value: '', indent: 0 }).value;
