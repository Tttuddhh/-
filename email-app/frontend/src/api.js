const API_BASE = 'http://localhost:3001/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (res.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
    throw new Error('未授权访问');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: '请求失败' }));
    throw new Error(err.error || '请求失败');
  }
  return res.json();
}

export const api = {
  auth: {
    register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    me: () => request('/auth/me'),
  },
  accounts: {
    list: () => request('/accounts'),
    add: (data) => request('/accounts', { method: 'POST', body: JSON.stringify(data) }),
    remove: (id) => request(`/accounts/${id}`, { method: 'DELETE' }),
    setActive: (id) => request(`/accounts/${id}/active`, { method: 'PUT' }),
  },
  emails: {
    list: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/emails${q ? '?' + q : ''}`);
    },
    get: (id) => request(`/emails/${id}`),
    toggleRead: (id, isRead) =>
      request(`/emails/${id}/read`, {
        method: 'PUT',
        body: JSON.stringify({ is_read: isRead }),
      }),
    send: (data) => request('/emails/send', { method: 'POST', body: JSON.stringify(data) }),
    reply: (id, data) =>
      request(`/emails/${id}/reply`, { method: 'POST', body: JSON.stringify(data) }),
    forward: (id, data) =>
      request(`/emails/${id}/forward`, { method: 'POST', body: JSON.stringify(data) }),
    delete: (id) => request(`/emails/${id}`, { method: 'DELETE' }),
    search: (q) => request(`/emails/search?q=${encodeURIComponent(q)}`),
  },
};