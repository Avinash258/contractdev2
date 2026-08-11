const { DomainError, codes } = require('./errors');

function transfer(store, userId, { fromAccountId, toAccountId, amount }) {
  const value = Number(amount);
  if (!Number.isFinite(value) || value <= 0) {
    throw new DomainError('Amount must be greater than zero', codes.INVALID_ARGUMENT, 'INVALID_ARGUMENT');
  }
  if (fromAccountId === toAccountId) {
    throw new DomainError('Source and destination must differ', codes.INVALID_ARGUMENT, 'INVALID_ARGUMENT');
  }

  const from = store.findAccount(fromAccountId);
  const to = store.findAccount(toAccountId);

  if (!from || from.userId !== userId) {
    throw new DomainError(`Account not found: ${fromAccountId}`, codes.NOT_FOUND, 'NOT_FOUND');
  }
  if (!to || to.userId !== userId) {
    throw new DomainError(`Account not found: ${toAccountId}`, codes.NOT_FOUND, 'NOT_FOUND');
  }
  if (from.balance < value) {
    throw new DomainError('Insufficient funds', codes.FAILED_PRECONDITION, 'FAILED_PRECONDITION');
  }

  from.balance = Number((from.balance - value).toFixed(2));
  to.balance = Number((to.balance + value).toFixed(2));

  const result = {
    id: `txn-${Date.now()}`,
    status: 'COMPLETED',
    amount: value,
  };
  store.addTransfer({
    ...result,
    fromAccountId,
    toAccountId,
    userId,
  });

  return result;
}

module.exports = { transfer };
