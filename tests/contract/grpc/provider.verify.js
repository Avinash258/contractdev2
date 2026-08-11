const fs = require('fs');
const path = require('path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const axios = require('axios');
const config = require('./config');
const { listConsumerPactFiles } = require('../lib/pact-files');
const { matchGrpcResponse } = require('./matchers');

function loadProto() {
  const definition = protoLoader.loadSync(config.protoPath, {
    keepCase: false,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });
  return grpc.loadPackageDefinition(definition).vaultmesh.v1;
}

function statusName(code) {
  return Object.keys(grpc.status).find((key) => grpc.status[key] === code) || String(code);
}

function promisifyUnary(client, method, request, metadata) {
  return new Promise((resolve) => {
    client[method](request, metadata, (error, response) => {
      if (error) {
        resolve({
          status: statusName(error.code),
          message: error.message,
          body: null,
        });
        return;
      }
      resolve({
        status: 'OK',
        body: JSON.parse(JSON.stringify(response)),
      });
    });
  });
}

function createClients(proto) {
  const address = `${config.host}:${config.port}`;
  const creds = grpc.credentials.createInsecure();
  return {
    'vaultmesh.v1.AuthService': new proto.AuthService(address, creds),
    'vaultmesh.v1.AccountService': new proto.AccountService(address, creds),
    'vaultmesh.v1.PaymentService': new proto.PaymentService(address, creds),
  };
}

function toMetadata(headers, token) {
  const metadata = new grpc.Metadata();
  for (const [key, value] of Object.entries(headers || {})) {
    if (key.toLowerCase() === 'authorization' && token) {
      metadata.set('authorization', `Bearer ${token}`);
    } else if (value) {
      metadata.set(key, String(value));
    }
  }
  return metadata;
}

async function loginToken(clients) {
  const result = await promisifyUnary(
    clients['vaultmesh.v1.AuthService'],
    'login',
    { email: config.demoEmail, password: config.demoPassword },
    new grpc.Metadata()
  );
  if (result.status !== 'OK' || !result.body?.token) {
    throw new Error(`gRPC login failed: ${result.status} ${result.message || ''}`);
  }
  return result.body.token;
}

async function resetState(state) {
  await axios.post(
    `${config.httpUrl.replace(/\/$/, '')}/__contract__/states`,
    { state },
    { timeout: 10000 }
  );
}

async function verifyGrpcContracts({ writeConsoleOutput = true } = {}) {
  const pactFiles = listConsumerPactFiles(config.pactsDir);
  if (pactFiles.length === 0) {
    throw new Error(`No gRPC pact files in ${config.pactsDir}. Run gRPC consumer tests first.`);
  }

  const proto = loadProto();
  const clients = createClients(proto);
  const token = await loginToken(clients);
  const results = [];

  for (const file of pactFiles) {
    const pact = JSON.parse(fs.readFileSync(file, 'utf8'));
    for (const interaction of pact.interactions || []) {
      await resetState(interaction.providerState || 'demo user exists');
      const client = clients[interaction.request.service];
      if (!client) {
        results.push({
          description: interaction.description,
          result: 'FAILED',
          error: `Unknown service ${interaction.request.service}`,
        });
        continue;
      }

      const method = interaction.request.method[0].toLowerCase() + interaction.request.method.slice(1);
      const needsAuth = Boolean(interaction.request.metadata?.authorization);
      const actual = await promisifyUnary(
        client,
        method,
        interaction.request.body || {},
        toMetadata(interaction.request.metadata, needsAuth ? token : null)
      );

      try {
        matchGrpcResponse(actual, interaction.response);
        results.push({ description: interaction.description, result: 'OK', status: actual.status });
        if (writeConsoleOutput) {
          console.log(`  PASS  ${interaction.description}`);
        }
      } catch (error) {
        results.push({
          description: interaction.description,
          result: 'FAILED',
          error: error.message,
          actual,
        });
        if (writeConsoleOutput) {
          console.log(`  FAIL  ${interaction.description}: ${error.message}`);
        }
      }
    }
  }

  const failed = results.filter((item) => item.result !== 'OK');
  return {
    success: failed.length === 0,
    protocol: 'grpc',
    provider: config.provider,
    target: `${config.host}:${config.port}`,
    pactUrls: pactFiles.map((file) => path.basename(file)),
    interactionResults: results,
    errors: failed.map((item) => item.error),
  };
}

async function runCli() {
  const result = await verifyGrpcContracts();
  if (!result.success) {
    console.error(result.errors.join('\n'));
    process.exit(1);
  }
  console.log('VaultMesh gRPC provider verification passed.');
}

if (require.main === module) {
  runCli();
}

module.exports = { verifyGrpcContracts };
