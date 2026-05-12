/**
 * API Utility for communicating with the local Express + SQLite backend.
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function request(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('auth_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'An unknown error occurred' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const api = {
  auth: {
    login: (credentials: any) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (data: any) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    me: () => request('/auth/me'),
    updateProfile: (data: any) => request('/auth/profile', { method: 'PATCH', body: JSON.stringify(data) }),
  },
  tickets: {
    list: () => request('/tickets'),
    get: (id: string) => request(`/tickets/${id}`),
    create: (data: any) => request('/tickets', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request(`/tickets/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  },
  announcements: {
    list: () => request('/announcements'),
    create: (data: any) => request('/announcements', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id: string) => request(`/announcements/${id}`, { method: 'DELETE' }),
  },
  settings: {
    get: (key: string) => request(`/settings/${key}`),
    set: (key: string, value: any) => request(`/settings/${key}`, { method: 'POST', body: JSON.stringify({ value }) }),
  }
};
