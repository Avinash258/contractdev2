const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const config = require('../config');
const { DomainError } = require('../domain/errors');

const STATUS = {
  UNAUTHENTICATED: grpc.status.UNAUTHENTICATED,
  NOT_FOUND: grpc.status.NOT_FOUND,
  INVALID_ARGUMENT: grpc.status.INVALID_ARGUMENT,
  FAILED_PRECONDITION: grpc.status.FAILED_PRECONDITION,
  INTERNAL: grpc.status.INTERNAL,
};

function grpcError(error) {
  if (error instanceof DomainError) {
    return {
      code: STATUS[error.grpcStatus] ?? grpc.status.INTERNAL,
      message: error.message,
    };
  }
  return { code: grpc.status.INTERNAL, message: error.message || 'Internal error' };
}

function readBearer(call) {
  const values = call.metadata.get('authorization');
  const header = values && values[0] ? String(values[0]) : '';
  if (!header.toLowerCase().startsWith('bearer ')) {
    return null;
  }
  return header.slice(7).trim();
}

function userFromCall(domain, call) {
  return domain.userFromToken(readBearer(call));
}

function createGrpcServer(domain) {
  const definition = protoLoader.loadSync(config.protoPath, {
    keepCase: false,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });
  const proto = grpc.loadPackageDefinition(definition).vaultmesh.v1;
  const server = new grpc.Server();

  server.addService(proto.AuthService.service, {
    login(call, callback) {
      try {
        const result = domain.login(call.request.email, call.request.password);
        callback(null, result);
      } catch (error) {
        callback(grpcError(error));
      }
    },
  });

  server.addService(proto.AccountService.service, {
    listAccounts(call, callback) {
      try {
        const accounts = domain.listAccounts(userFromCall(domain, call));
        callback(null, { accounts });
      } catch (error) {
        callback(grpcError(error));
      }
    },
    getAccount(call, callback) {
      try {
        const account = domain.getAccount(userFromCall(domain, call), call.request.id);
        callback(null, account);
      } catch (error) {
        callback(grpcError(error));
      }
    },
  });

  server.addService(proto.PaymentService.service, {
    transfer(call, callback) {
      try {
        const result = domain.transfer(userFromCall(domain, call), {
          fromAccountId: call.request.fromAccountId,
          toAccountId: call.request.toAccountId,
          amount: call.request.amount,
        });
        callback(null, result);
      } catch (error) {
        callback(grpcError(error));
      }
    },
  });

  return server;
}

function startGrpcServer(server, port = config.grpcPort) {
  return new Promise((resolve, reject) => {
    server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), (error, boundPort) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(boundPort);
    });
  });
}

module.exports = { createGrpcServer, startGrpcServer };
