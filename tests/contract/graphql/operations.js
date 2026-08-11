const LOGIN = `mutation Login($email: String!, $password: String!) { login(email: $email, password: $password) { token user { id email name } } }`;

const ME = `query Me { me { id email name } }`;

const ACCOUNTS = `query Accounts { accounts { id name currency balance } }`;

const TRANSFER = `mutation Transfer($fromAccountId: ID!, $toAccountId: ID!, $amount: Float!) { transfer(fromAccountId: $fromAccountId, toAccountId: $toAccountId, amount: $amount) { id status amount } }`;

const DEMO = {
  email: 'demo@fintech.com',
  password: 'demo123',
};

module.exports = { LOGIN, ME, ACCOUNTS, TRANSFER, DEMO };
