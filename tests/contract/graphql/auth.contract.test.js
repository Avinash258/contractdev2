const axios = require('axios');
const { Matchers } = require('@pact-foundation/pact');
const { createGraphqlProvider } = require('./pact-factory');
const { LOGIN, ME, DEMO } = require('./operations');
const { jwtToken } = require('../lib/matchers');

const { like, string, eachLike } = Matchers;

const MOCK_TOKEN = 'mock-jwt-token';

describe('VaultMesh GraphQL auth contract', () => {
  it('login returns token and user', () =>
    createGraphqlProvider()
      .addInteraction()
      .given('demo user exists')
      .uponReceiving('a GraphQL login mutation')
      .withRequest('POST', '/graphql', (builder) => {
        builder.jsonBody({
          query: LOGIN,
          variables: { email: DEMO.email, password: DEMO.password },
        });
      })
      .willRespondWith(200, (builder) => {
        builder.jsonBody({
          data: {
            login: {
              token: jwtToken(),
              user: like({
                id: string('user-001'),
                email: string(DEMO.email),
                name: string('Alex Morgan'),
              }),
            },
          },
        });
      })
      .executeTest(async ({ url }) => {
        const response = await axios.post(`${url}/graphql`, {
          query: LOGIN,
          variables: { email: DEMO.email, password: DEMO.password },
        });
        expect(response.data.data.login.token).toBeTruthy();
        expect(response.data.data.login.user.email).toBe(DEMO.email);
      }));

  it('me without token returns UNAUTHENTICATED', () =>
    createGraphqlProvider()
      .addInteraction()
      .given('demo user exists')
      .uponReceiving('a GraphQL me query without a bearer token')
      .withRequest('POST', '/graphql', (builder) => {
        builder.jsonBody({ query: ME });
      })
      .willRespondWith(200, (builder) => {
        builder.jsonBody({
          errors: eachLike({
            message: string('Unauthenticated'),
            extensions: like({
              code: string('UNAUTHENTICATED'),
            }),
          }),
        });
      })
      .executeTest(async ({ url }) => {
        const response = await axios.post(`${url}/graphql`, { query: ME });
        expect(response.data.errors[0].extensions.code).toBe('UNAUTHENTICATED');
      }));

  it('me with token returns the current user', () =>
    createGraphqlProvider()
      .addInteraction()
      .given('user is authenticated')
      .uponReceiving('a GraphQL me query with a bearer token')
      .withRequest('POST', '/graphql', (builder) => {
        builder.headers({ Authorization: `Bearer ${MOCK_TOKEN}` });
        builder.jsonBody({ query: ME });
      })
      .willRespondWith(200, (builder) => {
        builder.jsonBody({
          data: {
            me: like({
              id: string('user-001'),
              email: string(DEMO.email),
              name: string('Alex Morgan'),
            }),
          },
        });
      })
      .executeTest(async ({ url }) => {
        const response = await axios.post(
          `${url}/graphql`,
          { query: ME },
          { headers: { Authorization: `Bearer ${MOCK_TOKEN}` } }
        );
        expect(response.data.data.me.email).toBe(DEMO.email);
      }));
});
