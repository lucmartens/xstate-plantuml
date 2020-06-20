const fs = require('fs');
const path = require('path');
const xstate3 = require('xstate3');
const xstate4 = require('xstate');

const visualize = require('../core');

const example = (name, opts) => {
  const root = `${__dirname}/../../examples`;
  const json = require(`${root}/${name}.json`);
  let pumlPath = `${root}/${name}.puml`;
  // To support json for version 3 and 4 that have the same puml output:
  // put v4 definition in name.json
  // and v3 definition in name-v3.json
  if (/-v3$/.test(name) && !fs.existsSync(pumlPath)) {
    pumlPath = pumlPath.replace(/-v3.puml/, '.puml');
  }
  const puml = fs.readFileSync(pumlPath, 'utf8');

  test(name, () => {
    expect(visualize(json, opts)).toEqual(puml);
  });
};
const compatible = [
  'alarm',
  'internal',
  'payment',
  'text-editor',
  'word'
];
describe('examples', () => {
  describe('xstate@v3', () => {
    [
      ...compatible,
      'download',
      'text-editor-v3'
    ].forEach(name => example(name, {xstate:xstate3}))
  });
  describe('xstate@v4', () => {
    [
      ...compatible,
      'actions-only',
      'text-editor'
    ].forEach(name => example(name, {xstate:xstate4}))
  });
});
