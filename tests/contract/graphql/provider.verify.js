const path = require('path');
const { Verifier } = require('@pact-foundation/pact');
const config = require('./config');
const { listConsumerPactFiles } = require('../lib/pact-files');
const {
  createGraphqlAuthFilter,
  resetCachedToken,
  fetchGraphqlToken,
  resetProviderState,
} = require('./auth-filter');

async function verifyGraphqlContracts({ writeConsoleOutput = true } = {}) {
  const pactUrls = listConsumerPactFiles(config.pactsDir);
  if (pactUrls.length === 0) {
    throw new Error(`No GraphQL pact files in ${config.pactsDir}. Run GraphQL consumer tests first.`);
  }

  resetCachedToken();
  await resetProviderState('demo user exists');
  await fetchGraphqlToken({ forceRefresh: true });

  if (writeConsoleOutput) {
    console.log('Verifying VaultMesh GraphQL contracts...');
    console.log(`Provider: ${config.httpUrl}`);
    console.log(`Pacts: ${pactUrls.map((file) => path.basename(file)).join(', ')}`);
  }

  try {
    await new Verifier({
      provider: config.provider,
      providerBaseUrl: config.httpUrl,
      pactUrls,
      logLevel: 'info',
      requestFilter: createGraphqlAuthFilter(),
      stateHandlers: {
        'demo user exists': async () => resetProviderState('demo user exists'),
        'user is authenticated': async () => resetProviderState('user is authenticated'),
        'accounts exist for demo user': async () => resetProviderState('accounts exist for demo user'),
      },
      timeout: 30000,
    }).verifyProvider();

    return {
      success: true,
      protocol: 'graphql',
      provider: config.provider,
      providerBaseUrl: config.httpUrl,
      pactUrls: pactUrls.map((file) => path.basename(file)),
    };
  } catch (error) {
    return {
      success: false,
      protocol: 'graphql',
      provider: config.provider,
      providerBaseUrl: config.httpUrl,
      pactUrls: pactUrls.map((file) => path.basename(file)),
      error: error.message || String(error),
    };
  }
}

async function runCli() {
  const result = await verifyGraphqlContracts();
  if (!result.success) {
    console.error(result.error);
    process.exit(1);
  }
  console.log('VaultMesh GraphQL provider verification passed.');
}

if (require.main === module) {
  runCli();
}

module.exports = { verifyGraphqlContracts };
