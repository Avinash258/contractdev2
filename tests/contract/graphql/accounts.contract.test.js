const axios = require('axios');
const { Matchers } = require('@pact-foundation/pact');
const { createGraphqlProvider } = require('./pact-factory');
const { ACCOUNTS } = require('./operations');

const { like, string, number, eachLike } = Matchers;
const MOCK_TOKEN = 'mock-jwt-token';

describe('VaultMesh GraphQL accounts contract', () => {
  it('accounts returns checking and savings', () =>
    createGraphqlProvider()
      .addInteraction()
      .given('accounts exist for demo user')
      .uponReceiving('a GraphQL accounts query')
      .withRequest('POST', '/graphql', (builder) => {
        builder.headers({ Authorization: `Bearer ${MOCK_TOKEN}` });
        builder.jsonBody({ query: ACCOUNTS });
      })
      .willRespondWith(200, (builder) => {
        builder.jsonBody({
          data: {
            accounts: eachLike(
              like({
                id: string('acc-checking'),
                name: string('Primary Checking'),
                currency: string('USD'),
                balance: number(12500.5),
              }),
              2
            ),
          },
        });
      })
      .executeTest(async ({ url }) => {
        const response = await axios.post(
          `${url}/graphql`,
          { query: ACCOUNTS },
          { headers: { Authorization: `Bearer ${MOCK_TOKEN}` } }
        );
        expect(response.data.data.accounts.length).toBeGreaterThan(0);
        expect(response.data.data.accounts[0].currency).toBe('USD');
      }));
});
