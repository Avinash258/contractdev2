const path = require('path');

module.exports = {
  httpPort: Number(process.env.VAULTMESH_HTTP_PORT || 4000),
  grpcPort: Number(process.env.VAULTMESH_GRPC_PORT || 50051),
  jwtSecret: process.env.VAULTMESH_JWT_SECRET || 'vaultmesh-dev-secret',
  jwtExpiresIn: process.env.VAULTMESH_JWT_EXPIRES_IN || '8h',
  demoEmail: process.env.VAULTMESH_DEMO_EMAIL || 'demo@fintech.com',
  demoPassword: process.env.VAULTMESH_DEMO_PASSWORD || 'demo123',
  protoPath: path.join(__dirname, '..', 'proto', 'vaultmesh', 'v1', 'vaultmesh.proto'),
  schemaPath: path.join(__dirname, '..', 'schema.graphql'),
  uiPath: path.join(__dirname, '..', 'ui'),
};
