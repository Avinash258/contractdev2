const fs = require('fs');
const { buildSchema, graphql, GraphQLError } = require('graphql');
const config = require('../config');
const { DomainError } = require('../domain/errors');

function toGraphQLError(error) {
  if (error instanceof DomainError) {
    return new GraphQLError(error.message, {
      extensions: { code: error.code },
    });
  }
  return error;
}

function wrap(fn) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      throw toGraphQLError(error);
    }
  };
}

function createGraphqlHandler(domain) {
  const sdl = fs.readFileSync(config.schemaPath, 'utf8');
  const schema = buildSchema(sdl);

  const rootValue = {
    me: wrap((_args, ctx) => domain.me(ctx.user)),
    accounts: wrap((_args, ctx) => domain.listAccounts(ctx.user)),
    account: wrap(({ id }, ctx) => domain.getAccount(ctx.user, id)),
    login: wrap(({ email, password }) => domain.login(email, password)),
    transfer: wrap(({ fromAccountId, toAccountId, amount }, ctx) =>
      domain.transfer(ctx.user, { fromAccountId, toAccountId, amount })
    ),
  };

  return async function handleGraphql(req, res) {
    const source = req.body?.query;
    if (!source) {
      res.status(400).json({
        errors: [{ message: 'GraphQL query is required', extensions: { code: 'BAD_REQUEST' } }],
      });
      return;
    }

    const result = await graphql({
      schema,
      source,
      variableValues: req.body.variables || {},
      operationName: req.body.operationName,
      rootValue,
      contextValue: req.vaultmesh,
    });

    res.status(200).json(result);
  };
}

module.exports = { createGraphqlHandler };
