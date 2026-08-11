function mapUser(user) {
  return {
    id: String(user.id),
    email: String(user.email),
    name: String(user.name),
  };
}

function mapLoginReply(reply) {
  return {
    token: String(reply.token),
    user: mapUser(reply.user),
  };
}

function mapAccount(account) {
  return {
    id: String(account.id),
    name: String(account.name),
    currency: String(account.currency),
    balance: Number(account.balance),
  };
}

function mapTransfer(reply) {
  return {
    id: String(reply.id),
    status: String(reply.status),
    amount: Number(reply.amount),
  };
}

module.exports = { mapLoginReply, mapAccount, mapTransfer };
