const config = require('../config');

function seed() {
  return {
    users: [
      {
        id: 'user-001',
        email: config.demoEmail,
        password: config.demoPassword,
        name: 'Alex Morgan',
      },
    ],
    accounts: [
      {
        id: 'acc-checking',
        userId: 'user-001',
        name: 'Primary Checking',
        currency: 'USD',
        balance: 12500.5,
      },
      {
        id: 'acc-savings',
        userId: 'user-001',
        name: 'High-Yield Savings',
        currency: 'USD',
        balance: 8400,
      },
    ],
    transfers: [],
  };
}

function createStore() {
  let state = seed();

  return {
    reset() {
      state = seed();
      return state;
    },
    snapshot() {
      return state;
    },
    findUserByEmail(email) {
      return state.users.find((user) => user.email.toLowerCase() === String(email).toLowerCase());
    },
    findUserById(id) {
      return state.users.find((user) => user.id === id);
    },
    listAccounts(userId) {
      return state.accounts.filter((account) => account.userId === userId);
    },
    findAccount(id) {
      return state.accounts.find((account) => account.id === id);
    },
    addTransfer(transfer) {
      state.transfers.push(transfer);
    },
  };
}

module.exports = { createStore, seed };
