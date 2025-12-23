'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    if (typeof window === 'undefined') return null
    try {
      const stored = localStorage.getItem('user')
      return stored ? JSON.parse(stored) : null
    } catch (e) {
      return null
    }
  })

  const [loading] = useState(false)
  const router = useRouter()

  const login = (userData, token) => {
    const accessToken = token?.accessToken || token
    const refreshToken = token?.refreshToken

    const userInfo = {
      ...userData, // Spread all user data
      accessToken,
      refreshToken,
    }

    setUser(userInfo)
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(userInfo))
      localStorage.setItem('accessToken', accessToken)
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken)
      }
      document.cookie = `accessToken=${accessToken}; path=/; max-age=86400; SameSite=Lax`
      if (refreshToken) {
        document.cookie = `refreshToken=${refreshToken}; path=/; max-age=604800; SameSite=Lax`
      }
    }

    // Ensure we have the role before redirecting
    const role = (userData.role || 'user') === 'admin' ? '/admin' : '/'
    router.push(role)
  }

  const logout = () => {
    setUser(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      // Clear the token cookies
      document.cookie =
        'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      document.cookie =
        'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    }
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
