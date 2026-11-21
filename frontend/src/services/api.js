import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = ['accessToken', 'token', 'access_token']
    .map((key) => window.localStorage.getItem(key))
    .find(Boolean)

  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const apiMessage = error.response?.data?.message
    error.message = apiMessage
      || (error.code === 'ERR_NETWORK'
        ? 'Không kết nối được backend. Hãy khởi chạy backend rồi thử tải lại.'
        : error.code === 'ECONNABORTED'
          ? 'Backend phản hồi quá lâu. Hãy thử lại sau ít phút.'
          : error.message || 'Không thể kết nối máy chủ.')
    return Promise.reject(error)
  },
)

export default api
