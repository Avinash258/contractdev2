const { Matchers } = require('@pact-foundation/pact');

const { regex } = Matchers;

const jwtToken = () =>
  regex(
    /^eyJ[\w-]+\.[\w-]+\.[\w-]+$/,
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyLTAwMSJ9.mock'
  );

module.exports = { jwtToken };
