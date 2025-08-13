export async function fetchAccounts(id) {
  const url = id ? `/api/accounts?id=${encodeURIComponent(id)}` : `/api/accounts`;

  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to fetch accounts: ${res.status} ${res.statusText} - ${errorText}`);
  }
  return res.json();
}

export async function fetchUsers(id) {
  const url = id ? `/api/users?id=${encodeURIComponent(id)}` : `/api/users`;

  const res = await fetch(url, { cache: 'no-store' }); 
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to fetch users: ${res.status} ${res.statusText} - ${errorText}`);
  }
  return res.json();
}

export async function fetchPackages(id) {
  const url = id ? `/api/packages?id=${encodeURIComponent(id)}` : `/api/packages`;

  const res = await fetch(url, { cache: 'no-store' }); 
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to fetch users: ${res.status} ${res.statusText} - ${errorText}`);
  }
  return res.json();
}

export async function fetchOrders() {
  const url = `/api/orders`;

  const res = await fetch(url, { cache: 'no-store' }); 
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to fetch users: ${res.status} ${res.statusText} - ${errorText}`);
  }
  return res.json();
}

export async function updateAccount(accountId, updates) {
  if (!accountId || !updates || typeof updates !== 'object') {
    throw new Error("Missing or invalid 'accountId' or 'updates'");
  }

  const res = await fetch(`/api/accounts`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ accountId, updates }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to update account: ${res.status} ${res.statusText} - ${errorText}`);
  }

  return res.json(); // { message: 'Account updated successfully' }
}