const API_BASE = 'https://tu-backend-8bl4.onrender.com';
const getToken = () => localStorage.getItem('token');

const authHeaders = () => {
  const token = getToken();
  return token ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } : { 'Content-Type': 'application/json' };
};

export const api = {
  get: async (url) => {
    const res = await fetch(`${API_BASE}${url}`, { headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error en la peticion');
    return data;
  },
  post: async (url, body) => {
    const res = await fetch(`${API_BASE}${url}`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error en la peticion');
    return data;
  },
  put: async (url, body) => {
    const res = await fetch(`${API_BASE}${url}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error en la peticion');
    return data;
  },
  patch: async (url, body) => {
    const res = await fetch(`${API_BASE}${url}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error en la peticion');
    return data;
  },
  del: async (url) => {
    const res = await fetch(`${API_BASE}${url}`, { method: 'DELETE', headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error en la peticion');
    return data;
  },
  upload: async (url, formData) => {
    const token = getToken();
    const res = await fetch(`${API_BASE}${url}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al subir archivo');
    return data;
  }
};
