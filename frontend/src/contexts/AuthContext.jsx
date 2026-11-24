import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api from '../services/api.js'

const AuthContext = createContext(null)
const tokenKeys = ['accessToken', 'token', 'access_token']

function readAccessToken() {
  return tokenKeys.map((key) => window.localStorage.getItem(key)).find(Boolean) || ''
}

function responseData(response) {
  return response?.data && typeof response.data === 'object' ? response.data : response
}

function accountFromResponse(response) {
  const data = responseData(response)
  const account = data?.nguoiDung || data?.taiKhoan || data?.user || data?.account || data
  if (!account || typeof account !== 'object' || Array.isArray(account)) return null

  return ['_id', 'hoTen', 'email', 'vaiTro', 'trangThai'].some((key) => account[key] !== undefined)
    ? account
    : null
}

function tokenFromResponse(response) {
  const data = responseData(response)
  return data?.accessToken || data?.access_token || data?.token || data?.jwt || ''
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [authStatus, setAuthStatus] = useState(() => (readAccessToken() ? 'loading' : 'anonymous'))

  const refreshUser = useCallback(async () => {
    if (!readAccessToken()) {
      setUser(null)
      setAuthStatus('anonymous')
      return null
    }

    setAuthStatus('loading')
    try {
      const response = await api.get('/tai-khoan')
      const account = accountFromResponse(response)
      if (!account) throw new Error('API tài khoản chưa trả về hồ sơ hợp lệ.')
      setUser(account)
      setAuthStatus('authenticated')
      return account
    } catch {
      setUser(null)
      setAuthStatus('unavailable')
      return null
    }
  }, [])

  const setSession = useCallback(async (loginResponse) => {
    const token = tokenFromResponse(loginResponse)
    if (!token) throw new Error('Phản hồi đăng nhập chưa có JWT token.')

    window.localStorage.setItem('accessToken', token)
    const account = accountFromResponse(loginResponse)
    if (account) {
      setUser(account)
      setAuthStatus('authenticated')
      return account
    }

    return refreshUser()
  }, [refreshUser])

  const clearSession = useCallback(() => {
    tokenKeys.forEach((key) => window.localStorage.removeItem(key))
    setUser(null)
    setAuthStatus('anonymous')
  }, [])

  useEffect(() => {
    if (readAccessToken()) void refreshUser()

    const syncOtherTab = (event) => {
      if (event.key && !tokenKeys.includes(event.key)) return
      if (readAccessToken()) void refreshUser()
      else clearSession()
    }

    window.addEventListener('storage', syncOtherTab)
    return () => window.removeEventListener('storage', syncOtherTab)
  }, [clearSession, refreshUser])

  const value = useMemo(() => ({
    user,
    authStatus,
    refreshUser,
    setSession,
    clearSession,
  }), [user, authStatus, refreshUser, setSession, clearSession])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth phải được dùng bên trong AuthProvider.')
  return context
}
