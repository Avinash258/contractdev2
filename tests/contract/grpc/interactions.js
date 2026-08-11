const config = require('./config');

const interactions = [
  {
    description: 'Login returns token and user',
    providerState: 'demo user exists',
    request: {
      service: 'vaultmesh.v1.AuthService',
      method: 'Login',
      metadata: {},
      body: {
        email: config.demoEmail,
        password: config.demoPassword,
      },
    },
    response: {
      status: 'OK',
      body: {
        token: { regex: '^eyJ[\\w-]+\\.[\\w-]+\\.[\\w-]+$' },
        user: {
          id: { type: 'string' },
          email: config.demoEmail,
          name: { type: 'string' },
        },
      },
    },
  },
  {
    description: 'ListAccounts without token is unauthenticated',
    providerState: 'demo user exists',
    request: {
      service: 'vaultmesh.v1.AccountService',
      method: 'ListAccounts',
      metadata: {},
      body: {},
    },
    response: {
      status: 'UNAUTHENTICATED',
    },
  },
  {
    description: 'ListAccounts returns checking and savings',
    providerState: 'accounts exist for demo user',
    request: {
      service: 'vaultmesh.v1.AccountService',
      method: 'ListAccounts',
      metadata: { authorization: 'Bearer mock-jwt-token' },
      body: {},
    },
    response: {
      status: 'OK',
      body: {
        accounts: {
          minLength: 2,
          each: {
            id: { type: 'string' },
            name: { type: 'string' },
            currency: 'USD',
            balance: { type: 'number' },
          },
        },
      },
    },
  },
  {
    description: 'GetAccount returns checking account',
    providerState: 'accounts exist for demo user',
    request: {
      service: 'vaultmesh.v1.AccountService',
      method: 'GetAccount',
      metadata: { authorization: 'Bearer mock-jwt-token' },
      body: { id: 'acc-checking' },
    },
    response: {
      status: 'OK',
      body: {
        id: 'acc-checking',
        name: { type: 'string' },
        currency: 'USD',
        balance: { type: 'number' },
      },
    },
  },
  {
    description: 'Transfer completes between owned accounts',
    providerState: 'accounts exist for demo user',
    request: {
      service: 'vaultmesh.v1.PaymentService',
      method: 'Transfer',
      metadata: { authorization: 'Bearer mock-jwt-token' },
      body: {
        fromAccountId: 'acc-checking',
        toAccountId: 'acc-savings',
        amount: 25,
      },
    },
    response: {
      status: 'OK',
      body: {
        id: { type: 'string' },
        status: 'COMPLETED',
        amount: 25,
      },
    },
  },
];

function buildGrpcPact() {
  return {
    consumer: { name: config.consumer },
    provider: { name: config.provider },
    protocol: 'grpc',
    metadata: {
      spec: 'vaultmesh-grpc-1',
      proto: 'apps/vaultmesh/proto/vaultmesh/v1/vaultmesh.proto',
    },
    interactions,
  };
}

module.exports = { interactions, buildGrpcPact };
