const { createStore } = require('./store');
const { login, verifyToken, requireUser, publicUser } = require('./auth');
const { listAccounts, getAccount } = require('./accounts');
const { transfer } = require('./payments');
const config = require('../config');

function createDomain() {
  const store = createStore();

  function userFromToken(token) {
    const payload = verifyToken(token);
    if (!payload?.userId) {
      return null;
    }
    const record = store.findUserById(payload.userId);
    return record ? publicUser(record) : null;
  }

  return {
    reset: () => store.reset(),
    snapshot: () => store.snapshot(),
    login: (email, password) => login(store, email, password),
    userFromToken,
    requireUser: (user) => requireUser(store, user),
    me(user) {
      return requireUser(store, user);
    },
    listAccounts(user) {
      const current = requireUser(store, user);
      return listAccounts(store, current.id);
    },
    getAccount(user, id) {
      const current = requireUser(store, user);
      return getAccount(store, current.id, id);
    },
    transfer(user, input) {
      const current = requireUser(store, user);
      return transfer(store, current.id, input);
    },
    demoCredentials: {
      email: config.demoEmail,
      password: config.demoPassword,
    },
  };
}

module.exports = { createDomain };
