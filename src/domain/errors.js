class DomainError extends Error {
  constructor(message, code, grpcStatus) {
    super(message);
    this.name = 'DomainError';
    this.code = code;
    this.grpcStatus = grpcStatus;
  }
}

const codes = {
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  NOT_FOUND: 'NOT_FOUND',
  INVALID_ARGUMENT: 'INVALID_ARGUMENT',
  FAILED_PRECONDITION: 'FAILED_PRECONDITION',
};

module.exports = { DomainError, codes };
