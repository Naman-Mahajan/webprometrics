// Simple smoke test (requires server running on PORT or 8080)
// Steps: signup (random email), login, create client, list clients

const BASE = process.env.BASE_URL || `http://localhost:${process.env.PORT || 8080}/api`;

const rand = Math.random().toString(36).slice(2, 8);
const email = `smoke_${rand}@example.com`;
const password = `Smoke!23${rand}`;

const fetchJson = async (url, opts = {}) => {
  const res = await fetch(url, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
  });
  const text = await res.text();
  try {
    return { ok: res.ok, status: res.status, json: JSON.parse(text) };
  } catch {
    return { ok: res.ok, status: res.status, text };
  }
};

(async () => {
  console.log('BASE', BASE);

  // Signup
  const signup = await fetchJson(`${BASE}/auth/signup`, {
    method: 'POST',
    body: JSON.stringify({ name: 'Smoke Test', email, password, companyName: 'SmokeCo' })
  });
  if (!signup.ok) {
    console.error('Signup failed', signup);
    process.exit(1);
  }
  console.log('Signup OK');

  // Login
  const login = await fetchJson(`${BASE}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  if (!login.ok || !login.json?.token) {
    console.error('Login failed', login);
    process.exit(1);
  }
  console.log('Login OK');
  const token = login.json.token;

  // Create client
  const createClient = await fetchJson(`${BASE}/clients`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name: `Client ${rand}`, website: 'https://example.com' })
  });
  if (!createClient.ok) {
    console.error('Create client failed', createClient);
    process.exit(1);
  }
  console.log('Create client OK');

  // List clients
  const listClients = await fetchJson(`${BASE}/clients`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!listClients.ok) {
    console.error('List clients failed', listClients);
    process.exit(1);
  }
  const found = (listClients.json || []).find(c => c.name === `Client ${rand}`);
  if (!found) {
    console.error('Created client not found in list');
    process.exit(1);
  }
  console.log('Smoke test passed ✅');
  process.exit(0);
})().catch(err => {
  console.error('Smoke test error', err);
  process.exit(1);
});
