const parser = require('./parser');
const formatter = require('./formatter');

module.exports.default = (config, options = {}) =>
  formatter.default(parser.root(config));
