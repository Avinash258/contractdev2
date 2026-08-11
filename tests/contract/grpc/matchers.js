function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function matchValue(actual, expected, path) {
  if (expected && typeof expected === 'object' && expected.regex) {
    if (typeof actual !== 'string' || !new RegExp(expected.regex).test(actual)) {
      throw new Error(`${path}: expected /${expected.regex}/, got ${JSON.stringify(actual)}`);
    }
    return;
  }

  if (expected && typeof expected === 'object' && expected.type) {
    if (expected.type === 'number' && typeof actual !== 'number') {
      throw new Error(`${path}: expected number, got ${JSON.stringify(actual)}`);
    }
    if (expected.type === 'string' && typeof actual !== 'string') {
      throw new Error(`${path}: expected string, got ${JSON.stringify(actual)}`);
    }
    return;
  }

  if (expected && typeof expected === 'object' && expected.each) {
    if (!Array.isArray(actual)) {
      throw new Error(`${path}: expected array, got ${JSON.stringify(actual)}`);
    }
    if (expected.minLength && actual.length < expected.minLength) {
      throw new Error(`${path}: expected at least ${expected.minLength} items, got ${actual.length}`);
    }
    actual.forEach((item, index) => matchValue(item, expected.each, `${path}[${index}]`));
    return;
  }

  if (isPlainObject(expected)) {
    if (!isPlainObject(actual)) {
      throw new Error(`${path}: expected object, got ${JSON.stringify(actual)}`);
    }
    for (const key of Object.keys(expected)) {
      matchValue(actual[key], expected[key], `${path}.${key}`);
    }
    return;
  }

  if (actual !== expected) {
    throw new Error(`${path}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function matchGrpcResponse(actual, expected) {
  if (actual.status !== expected.status) {
    throw new Error(`status: expected ${expected.status}, got ${actual.status} (${actual.message || ''})`);
  }
  if (expected.body) {
    matchValue(actual.body, expected.body, 'body');
  }
}

module.exports = { matchGrpcResponse };
