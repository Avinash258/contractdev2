const path = require('path');

module.exports = {
  consumer: 'VaultMesh-Web',
  provider: 'VaultMesh-Core',
  pactsDir: process.env.VAULTMESH_GRPC_PACTS_DIR || 'pacts/grpc',
  host: process.env.VAULTMESH_GRPC_HOST || 'localhost',
  port: Number(process.env.VAULTMESH_GRPC_PORT || 50051),
  httpUrl: process.env.VAULTMESH_URL || 'http://localhost:4000',
  protoPath: path.resolve(process.cwd(), 'proto/vaultmesh/v1/vaultmesh.proto'),
  demoEmail: process.env.VAULTMESH_DEMO_EMAIL || 'demo@fintech.com',
  demoPassword: process.env.VAULTMESH_DEMO_PASSWORD || 'demo123',
};
