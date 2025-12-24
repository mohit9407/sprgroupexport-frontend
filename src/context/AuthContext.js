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
    // Get roles from userData or default to ['user']
    const roles = userData.roles || ['user']
    const isAdmin = roles.includes('admin')
    const role = isAdmin ? 'admin' : 'user'

    const userInfo = {
      ...userData,
      roles, // Keep the roles array
      role, // For backward compatibility
      isAdmin,
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

    // Redirect based on role
    const redirectPath = isAdmin ? '/admin' : '/'
    router.push(redirectPath)
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
