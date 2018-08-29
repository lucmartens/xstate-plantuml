const fs = require('fs');
const path = require('path');

const convert = require('../core');

const example = (name, opts) => {
  const root = `${__dirname}/../../examples`;
  const json = require(`${root}/${name}.json`);
  const puml = fs.readFileSync(`${root}/${name}.puml`, 'utf8');

  test(name, () => {
    expect(convert(json, opts)).toEqual(puml);
  });
};

describe('xstate-plantuml core examples', () => {
  example('alarm');
  example('bank');
  example('parallel');
});
