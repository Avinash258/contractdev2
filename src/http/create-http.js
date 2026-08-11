const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const config = require('../config');
const { createGraphqlHandler } = require('../graphql/create-graphql');

function bearerToken(header) {
  if (!header || typeof header !== 'string') {
    return null;
  }
  if (!header.toLowerCase().startsWith('bearer ')) {
    return null;
  }
  return header.slice(7).trim();
}

function createHttpApp(domain) {
  const app = express();
  const handleGraphql = createGraphqlHandler(domain);

  app.use(cors());
  app.use(express.json());

  app.use((req, _res, next) => {
    const token = bearerToken(req.headers.authorization);
    req.vaultmesh = {
      token,
      user: domain.userFromToken(token),
    };
    next();
  });

  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'vaultmesh',
      graphql: '/graphql',
      grpc: { host: '0.0.0.0', port: config.grpcPort },
      website: '/',
    });
  });

  app.get('/schema.graphql', (_req, res) => {
    res.type('text/plain').send(fs.readFileSync(config.schemaPath, 'utf8'));
  });

  app.get('/proto/vaultmesh.proto', (_req, res) => {
    res.type('text/plain').send(fs.readFileSync(config.protoPath, 'utf8'));
  });

  app.post('/__contract__/states', (req, res) => {
    domain.reset();
    res.json({
      ok: true,
      state: req.body?.state || 'reset',
      accounts: domain.snapshot().accounts.map((account) => account.id),
    });
  });

  app.post('/graphql', handleGraphql);

  app.use(express.static(config.uiPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/graphql') || req.path.startsWith('/__contract__')) {
      next();
      return;
    }
    res.sendFile(path.join(config.uiPath, 'index.html'));
  });

  return app;
}

module.exports = { createHttpApp };
