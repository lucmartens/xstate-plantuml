const fs = require('fs');
const path = require('path');

const visualize = require('../core');

const example = (name, opts) => {
  const root = `${__dirname}/../../examples`;
  const json = require(`${root}/${name}.json`);
  const puml = fs.readFileSync(`${root}/${name}.puml`, 'utf8');

  test(name, () => {
    expect(visualize(json, opts)).toEqual(puml);
  });
};

describe('examples', () => {
  example('alarm');
  example('download');
  example('payment');
  example('text-editor');
});
