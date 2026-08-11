module.exports = {
  testTimeout: 30000,
  testMatch: [
    '**/tests/contract/graphql/**/*.contract.test.js',
    '**/tests/contract/grpc/**/*.contract.test.js',
  ],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@pact-foundation|https-proxy-agent|agent-base|proxy-agent-negotiate)/)',
  ],
};
