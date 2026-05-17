import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import client from '../api/client'
import type { User } from '../types'

interface AuthContextValue {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, username: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return Date.now() / 1000 > payload.exp
  } catch {
    return true
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('dresser_token')
    if (stored && !isTokenExpired(stored)) {
      setToken(stored)
      client.get('/auth/me').then((res) => setUser(res.data)).catch(() => {
        localStorage.removeItem('dresser_token')
        setToken(null)
      })
    } else if (stored) {
      localStorage.removeItem('dresser_token')
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await client.post('/auth/login', { email, password })
    const { access_token, user } = res.data
    localStorage.setItem('dresser_token', access_token)
    setToken(access_token)
    setUser(user)
  }, [])

  const register = useCallback(async (email: string, username: string, password: string) => {
    const res = await client.post('/auth/register', { email, username, password })
    const { access_token, user } = res.data
    localStorage.setItem('dresser_token', access_token)
    setToken(access_token)
    setUser(user)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('dresser_token')
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
