const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }

  return response;
}

export const puzzleApi = {
  list: (page = 1, limit = 10) => fetchWithAuth(`/puzzles?page=${page}&limit=${limit}`).then(res => res.json()),
  get: (id: string) => fetchWithAuth(`/puzzles/${id}`).then(res => res.json()),
  create: (data: any) => fetchWithAuth('/admin/puzzles', {
    method: 'POST',
    body: JSON.stringify(data),
  }).then(res => res.json()),
  update: (id: string, data: any) => fetchWithAuth(`/admin/puzzles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }).then(res => res.json()),
  delete: (id: string) => fetchWithAuth(`/admin/puzzles/${id}`, {
    method: 'DELETE',
  }),
};

export const adminApi = {
  getStats: () => fetchWithAuth('/admin/stats').then(res => res.json()),
  listUsers: (page = 1, limit = 10) => fetchWithAuth(`/admin/users?page=${page}&limit=${limit}`).then(res => res.json()),
  getEngineStatus: () => fetchWithAuth('/admin/engine/status').then(res => res.json()),
};

export const categoryApi = {
  list: () => fetchWithAuth('/admin/categories').then(res => res.json()),
  create: (data: { name: string; description?: string }) => fetchWithAuth('/admin/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  }).then(res => res.json()),
  update: (id: string, data: { name?: string; description?: string }) => fetchWithAuth(`/admin/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }).then(res => res.json()),
  delete: (id: string) => fetchWithAuth(`/admin/categories/${id}`, {
    method: 'DELETE',
  }),
};

export const settingsApi = {
  list: () => fetchWithAuth('/admin/settings').then(res => res.json()),
  update: (data: { key: string; value: string; description?: string }) => fetchWithAuth('/admin/settings', {
    method: 'POST',
    body: JSON.stringify(data),
  }).then(res => res.json()),
};

export const authApi = {
  guestLogin: (name: string) => fetch(`${API_URL}/auth/guest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  }).then(res => res.json()),
  googleLogin: (idToken: string) => fetch(`${API_URL}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_token: idToken }),
  }).then(res => res.json()),
};
