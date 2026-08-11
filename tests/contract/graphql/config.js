const { normalizeUrl } = require('../lib/url-utils');

const httpUrl = normalizeUrl(process.env.VAULTMESH_URL || 'http://localhost:4000');

module.exports = {
  consumer: 'VaultMesh-Web',
  provider: 'VaultMesh-GraphQL',
  pactsDir: process.env.VAULTMESH_GRAPHQL_PACTS_DIR || 'pacts/graphql',
  httpUrl,
  graphqlUrl: `${httpUrl}/graphql`,
  healthUrl: `${httpUrl}/health`,
  statesUrl: `${httpUrl}/__contract__/states`,
  demoEmail: process.env.VAULTMESH_DEMO_EMAIL || 'demo@fintech.com',
  demoPassword: process.env.VAULTMESH_DEMO_PASSWORD || 'demo123',
};
