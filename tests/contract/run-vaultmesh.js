const fs = require('fs');
const path = require('path');
const { spawn, execFileSync } = require('child_process');
const axios = require('axios');
const graphqlConfig = require('./graphql/config');
const { verifyGraphqlContracts } = require('./graphql/provider.verify');
const { verifyGrpcContracts } = require('./grpc/provider.verify');
const { clearPactArtifacts } = require('./lib/pact-files');

const rootDir = process.cwd();
const appDir = rootDir;
const skipProvider = process.argv.includes('--consumer-only');
const skipConsumer = process.argv.includes('--provider-only');
const skipStart = process.argv.includes('--no-start');

function runJest(testMatch, outputFile) {
  const jestBin = path.join(rootDir, 'node_modules/jest/bin/jest.js');
  execFileSync(
    process.execPath,
    [
      jestBin,
      '--config',
      'jest.config.js',
      '--testMatch',
      testMatch,
      '--json',
      `--outputFile=${outputFile}`,
      '--runInBand',
    ],
    { cwd: rootDir, stdio: 'inherit' }
  );
}

async function waitForHealth(url, attempts = 40) {
  for (let i = 0; i < attempts; i += 1) {
    try {
      const response = await axios.get(url, { timeout: 1000, validateStatus: () => true });
      if (response.status === 200 && response.data?.status === 'ok') {
        return;
      }
    } catch {
      // keep waiting
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(
    `VaultMesh is not running at ${url}\n` +
      `Start the app from this folder, then re-run tests:\n` +
      `  ${appDir}\n` +
      `  npm start\n` +
      `  or double-click START.bat`
  );
}

function startVaultMesh() {
  return spawn(process.execPath, ['src/server.js'], {
    cwd: appDir,
    stdio: 'inherit',
    env: { ...process.env, PACT_DO_NOT_TRACK: 'true' },
  });
}

function stopVaultMesh(child) {
  if (!child || child.killed) {
    return;
  }
  child.kill();
}

async function main() {
  const reportsDir = path.join(rootDir, 'reports');
  fs.mkdirSync(reportsDir, { recursive: true });
  fs.mkdirSync(path.join(rootDir, 'pacts/graphql'), { recursive: true });
  fs.mkdirSync(path.join(rootDir, 'pacts/grpc'), { recursive: true });

  let consumerGraphql = { ok: true };
  let consumerGrpc = { ok: true };

  if (!skipConsumer) {
    clearPactArtifacts('pacts/graphql');
    clearPactArtifacts('pacts/grpc');
    console.log('Running VaultMesh GraphQL consumer tests...');
    try {
      runJest(
        '**/tests/contract/graphql/**/*.contract.test.js',
        path.join('reports', 'vaultmesh-graphql-consumer.json')
      );
    } catch (error) {
      console.error(error.message || error);
      consumerGraphql = { ok: false, status: error.status ?? 1 };
    }

    console.log('Running VaultMesh gRPC consumer tests...');
    try {
      runJest(
        '**/tests/contract/grpc/**/*.contract.test.js',
        path.join('reports', 'vaultmesh-grpc-consumer.json')
      );
    } catch (error) {
      console.error(error.message || error);
      consumerGrpc = { ok: false, status: error.status ?? 1 };
    }
  }

  let child = null;
  let graphqlVerify = null;
  let grpcVerify = null;

  if (!skipProvider) {
    try {
      if (skipStart) {
        console.log(`\nUsing VaultMesh already running from:\n  ${appDir}`);
        await waitForHealth(graphqlConfig.healthUrl);
      } else {
        console.log('\nStarting VaultMesh...');
        child = startVaultMesh();
        await waitForHealth(graphqlConfig.healthUrl);
      }

      console.log('\nVerifying GraphQL provider...');
      graphqlVerify = await verifyGraphqlContracts();
      console.log('\nVerifying gRPC provider...');
      grpcVerify = await verifyGrpcContracts();
    } finally {
      stopVaultMesh(child);
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    website: graphqlConfig.httpUrl,
    consumer: {
      graphql: consumerGraphql.ok ? 'passed' : 'failed',
      grpc: consumerGrpc.ok ? 'passed' : 'failed',
    },
    provider: {
      graphql: graphqlVerify,
      grpc: grpcVerify,
    },
  };

  const reportPath = path.join(reportsDir, 'vaultmesh-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\nVaultMesh report: ${reportPath}`);

  const failed =
    !consumerGraphql.ok ||
    !consumerGrpc.ok ||
    (graphqlVerify && !graphqlVerify.success) ||
    (grpcVerify && !grpcVerify.success);

  if (failed) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('VaultMesh contract pipeline failed:', error);
  process.exit(1);
});
