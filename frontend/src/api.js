const API_URL = 'http://127.0.0.1:8000';

export const getImageUrl = (path) => (path ? `${API_URL}${path}` : '');

export async function api(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = res.headers.get('content-type')?.includes('application/json') ? await res.json() : await res.text();
  if (!res.ok) throw new Error(data.detail || data || 'Request failed');
  return data;
}
