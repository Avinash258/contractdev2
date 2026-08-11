const state = {
  token: sessionStorage.getItem('vaultmeshToken') || '',
  user: JSON.parse(sessionStorage.getItem('vaultmeshUser') || 'null'),
};

async function graphql(query, variables = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (state.token) {
    headers.Authorization = `Bearer ${state.token}`;
  }
  const response = await fetch('/graphql', {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  });
  return response.json();
}

function showError(id, message) {
  const el = document.getElementById(id);
  el.hidden = !message;
  el.textContent = message || '';
}

function money(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

function renderSession() {
  const meta = document.getElementById('session-meta');
  const loginCard = document.getElementById('login-card');
  const appCard = document.getElementById('app-card');
  if (state.user) {
    meta.textContent = `${state.user.name} · ${state.user.email}`;
    loginCard.hidden = true;
    appCard.hidden = false;
  } else {
    meta.textContent = 'Signed out';
    loginCard.hidden = false;
    appCard.hidden = true;
  }
}

function fillSelect(select, accounts, selectedId) {
  select.innerHTML = accounts
    .map(
      (account) =>
        `<option value="${account.id}" ${account.id === selectedId ? 'selected' : ''}>${account.name}</option>`
    )
    .join('');
}

async function loadAccounts() {
  const result = await graphql(`
    query Accounts {
      accounts { id name currency balance }
    }
  `);
  if (result.errors) {
    throw new Error(result.errors[0].message);
  }
  const accounts = result.data.accounts;
  document.getElementById('accounts').innerHTML = accounts
    .map(
      (account) => `
        <article class="account">
          <span>${account.name}</span>
          <strong>${money(account.balance)}</strong>
          <small>${account.id} · ${account.currency}</small>
        </article>`
    )
    .join('');

  fillSelect(document.getElementById('from-account'), accounts, 'acc-checking');
  fillSelect(document.getElementById('to-account'), accounts, 'acc-savings');
}

document.querySelectorAll('.tabs button').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.tabs button').forEach((item) => item.classList.remove('active'));
    document.querySelectorAll('.panel').forEach((panel) => panel.classList.remove('active'));
    button.classList.add('active');
    document.getElementById(`tab-${button.dataset.tab}`).classList.add('active');
  });
});

document.getElementById('login-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  showError('login-error', '');
  const result = await graphql(
    `mutation Login($email: String!, $password: String!) {
      login(email: $email, password: $password) {
        token
        user { id email name }
      }
    }`,
    {
      email: document.getElementById('email').value,
      password: document.getElementById('password').value,
    }
  );
  if (result.errors) {
    showError('login-error', result.errors[0].message);
    return;
  }
  state.token = result.data.login.token;
  state.user = result.data.login.user;
  sessionStorage.setItem('vaultmeshToken', state.token);
  sessionStorage.setItem('vaultmeshUser', JSON.stringify(state.user));
  renderSession();
  await loadAccounts();
});

document.getElementById('transfer-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const msg = document.getElementById('transfer-msg');
  const result = await graphql(
    `mutation Transfer($fromAccountId: ID!, $toAccountId: ID!, $amount: Float!) {
      transfer(fromAccountId: $fromAccountId, toAccountId: $toAccountId, amount: $amount) {
        id status amount
      }
    }`,
    {
      fromAccountId: document.getElementById('from-account').value,
      toAccountId: document.getElementById('to-account').value,
      amount: Number(document.getElementById('amount').value),
    }
  );
  if (result.errors) {
    msg.textContent = result.errors[0].message;
    return;
  }
  msg.textContent = `${result.data.transfer.status} ${money(result.data.transfer.amount)} · ${result.data.transfer.id}`;
  await loadAccounts();
});

document.getElementById('run-query').addEventListener('click', async () => {
  const result = await graphql(document.getElementById('gql-query').value);
  document.getElementById('gql-result').textContent = JSON.stringify(result, null, 2);
});

async function loadHealth() {
  try {
    const response = await fetch('/health');
    const body = await response.json();
    document.getElementById('health-result').textContent = JSON.stringify(body, null, 2);
  } catch (error) {
    document.getElementById('health-result').textContent = error.message;
  }
}

renderSession();
loadHealth();
if (state.token) {
  loadAccounts().catch((error) => {
    state.token = '';
    state.user = null;
    sessionStorage.removeItem('vaultmeshToken');
    sessionStorage.removeItem('vaultmeshUser');
    renderSession();
    showError('login-error', error.message);
  });
}
