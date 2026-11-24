const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function callApi(endpoint, options = {}) {
  const token = localStorage.getItem('accessToken');
  const isFormData = options.body instanceof FormData;

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const result = await response.json();
  if (!response.ok || result.success === false) {
    throw new Error(result.message || 'Có lỗi xảy ra từ máy chủ');
  }
  return result;
}