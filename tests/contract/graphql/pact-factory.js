const path = require('path');
const { Pact } = require('@pact-foundation/pact');
const config = require('./config');

function createGraphqlProvider() {
  return new Pact({
    consumer: config.consumer,
    provider: config.provider,
    dir: path.resolve(process.cwd(), config.pactsDir),
  });
}

module.exports = { createGraphqlProvider };
