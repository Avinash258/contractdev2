const axios = require('axios');
const config = require('./config');
const { LOGIN, DEMO } = require('./operations');

let cachedToken = null;

function resetCachedToken() {
  cachedToken = null;
}

async function fetchGraphqlToken({ forceRefresh = false } = {}) {
  if (cachedToken && !forceRefresh) {
    return cachedToken;
  }

  const response = await axios.post(
    config.graphqlUrl,
    {
      query: LOGIN,
      variables: { email: DEMO.email, password: DEMO.password },
    },
    { validateStatus: () => true, timeout: 15000 }
  );

  const token = response.data?.data?.login?.token;
  if (!token) {
    throw new Error(`VaultMesh GraphQL login failed: ${JSON.stringify(response.data)}`);
  }

  cachedToken = token;
  return cachedToken;
}

function createGraphqlAuthFilter() {
  return (req, _res, next) => {
    const auth = req.headers.authorization || req.headers.Authorization;
    if (!auth || !String(auth).startsWith('Bearer ')) {
      next();
      return;
    }

    fetchGraphqlToken()
      .then((token) => {
        req.headers.authorization = `Bearer ${token}`;
        req.headers.Authorization = `Bearer ${token}`;
        next();
      })
      .catch(next);
  };
}

async function resetProviderState(state = 'demo user exists') {
  await axios.post(config.statesUrl, { state }, { timeout: 10000 });
}

module.exports = {
  resetCachedToken,
  fetchGraphqlToken,
  createGraphqlAuthFilter,
  resetProviderState,
};
