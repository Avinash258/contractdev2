const { DomainError, codes } = require('./errors');

function toAccount(account) {
  return {
    id: account.id,
    name: account.name,
    currency: account.currency,
    balance: account.balance,
  };
}

function listAccounts(store, userId) {
  return store.listAccounts(userId).map(toAccount);
}

function getAccount(store, userId, id) {
  const account = store.findAccount(id);
  if (!account || account.userId !== userId) {
    throw new DomainError(`Account not found: ${id}`, codes.NOT_FOUND, 'NOT_FOUND');
  }
  return toAccount(account);
}

module.exports = { listAccounts, getAccount, toAccount };
