const fs = require('fs');
const path = require('path');
const config = require('./config');
const { buildGrpcPact, interactions } = require('./interactions');
const { mapLoginReply, mapAccount, mapTransfer } = require('./client-mappers');

describe('VaultMesh gRPC consumer contract', () => {
  it('maps login, account, and transfer replies the UI/core client expects', () => {
    const login = mapLoginReply({
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyLTAwMSJ9.mock',
      user: { id: 'user-001', email: config.demoEmail, name: 'Alex Morgan' },
    });
    expect(login.user.email).toBe(config.demoEmail);

    const account = mapAccount({
      id: 'acc-checking',
      name: 'Primary Checking',
      currency: 'USD',
      balance: 12500.5,
    });
    expect(account.balance).toBe(12500.5);

    const transfer = mapTransfer({ id: 'txn-1', status: 'COMPLETED', amount: 25 });
    expect(transfer.status).toBe('COMPLETED');
  });

  it('writes the gRPC contract from consumer interactions', () => {
    expect(interactions).toHaveLength(5);
    const pact = buildGrpcPact();
    fs.mkdirSync(path.resolve(process.cwd(), config.pactsDir), { recursive: true });
    const file = path.resolve(
      process.cwd(),
      config.pactsDir,
      `${config.consumer}-${config.provider}.json`
    );
    fs.writeFileSync(file, JSON.stringify(pact, null, 2));
    expect(fs.existsSync(file)).toBe(true);
    expect(pact.protocol).toBe('grpc');
    expect(pact.interactions.map((item) => item.request.method)).toEqual([
      'Login',
      'ListAccounts',
      'ListAccounts',
      'GetAccount',
      'Transfer',
    ]);
  });
});
