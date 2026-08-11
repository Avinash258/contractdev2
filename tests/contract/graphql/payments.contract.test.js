const axios = require('axios');
const { Matchers } = require('@pact-foundation/pact');
const { createGraphqlProvider } = require('./pact-factory');
const { TRANSFER } = require('./operations');

const { like, string, number } = Matchers;
const MOCK_TOKEN = 'mock-jwt-token';

describe('VaultMesh GraphQL payments contract', () => {
  it('transfer moves funds between accounts', () =>
    createGraphqlProvider()
      .addInteraction()
      .given('accounts exist for demo user')
      .uponReceiving('a GraphQL transfer mutation')
      .withRequest('POST', '/graphql', (builder) => {
        builder.headers({ Authorization: `Bearer ${MOCK_TOKEN}` });
        builder.jsonBody({
          query: TRANSFER,
          variables: {
            fromAccountId: 'acc-checking',
            toAccountId: 'acc-savings',
            amount: 25,
          },
        });
      })
      .willRespondWith(200, (builder) => {
        builder.jsonBody({
          data: {
            transfer: like({
              id: string('txn-1000'),
              status: string('COMPLETED'),
              amount: number(25),
            }),
          },
        });
      })
      .executeTest(async ({ url }) => {
        const response = await axios.post(
          `${url}/graphql`,
          {
            query: TRANSFER,
            variables: {
              fromAccountId: 'acc-checking',
              toAccountId: 'acc-savings',
              amount: 25,
            },
          },
          { headers: { Authorization: `Bearer ${MOCK_TOKEN}` } }
        );
        expect(response.data.data.transfer.status).toBe('COMPLETED');
        expect(response.data.data.transfer.amount).toBe(25);
        expect(response.data.data.transfer.id).toBeTruthy();
      }));
});
