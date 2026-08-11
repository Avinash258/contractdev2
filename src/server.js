const config = require('./config');
const { createDomain } = require('./domain');
const { createHttpApp } = require('./http/create-http');
const { createGrpcServer, startGrpcServer } = require('./grpc/create-grpc');

async function main() {
  const domain = createDomain();
  const app = createHttpApp(domain);
  const grpcServer = createGrpcServer(domain);

  const httpServer = await new Promise((resolve) => {
    const server = app.listen(config.httpPort, () => resolve(server));
  });

  const grpcPort = await startGrpcServer(grpcServer, config.grpcPort);

  console.log(`VaultMesh website  http://localhost:${config.httpPort}`);
  console.log(`VaultMesh GraphQL  http://localhost:${config.httpPort}/graphql`);
  console.log(`VaultMesh gRPC     localhost:${grpcPort}`);
  console.log(`Demo login         ${domain.demoCredentials.email} / ${domain.demoCredentials.password}`);

  const shutdown = () => {
    httpServer.close();
    grpcServer.tryShutdown(() => process.exit(0));
    setTimeout(() => process.exit(0), 2000).unref();
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((error) => {
  console.error('VaultMesh failed to start:', error);
  process.exit(1);
});
