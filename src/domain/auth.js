const jwt = require('jsonwebtoken');
const config = require('../config');
const { DomainError, codes } = require('./errors');

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
}

function login(store, email, password) {
  const user = store.findUserByEmail(email);
  if (!user || user.password !== password) {
    throw new DomainError('Invalid credentials', codes.INVALID_CREDENTIALS, 'UNAUTHENTICATED');
  }

  const token = jwt.sign({ userId: user.id, email: user.email }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });

  return { token, user: publicUser(user) };
}

function verifyToken(token) {
  if (!token) {
    return null;
  }

  try {
    return jwt.verify(token, config.jwtSecret);
  } catch {
    return null;
  }
}

function requireUser(store, user) {
  if (!user) {
    throw new DomainError('Unauthenticated', codes.UNAUTHENTICATED, 'UNAUTHENTICATED');
  }
  const record = store.findUserById(user.id);
  if (!record) {
    throw new DomainError('Unauthenticated', codes.UNAUTHENTICATED, 'UNAUTHENTICATED');
  }
  return publicUser(record);
}

module.exports = { login, verifyToken, requireUser, publicUser };
