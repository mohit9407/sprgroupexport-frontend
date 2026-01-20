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

  // Sync user state with localStorage changes
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'user') {
        try {
          const newUser = e.newValue ? JSON.parse(e.newValue) : null
 
          setUser(newUser)
        } catch (error) {
          console.error('Error parsing user from localStorage:', error)
          setUser(null)
        }
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange)
      return () => window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  // Force re-render when user state changes to ensure UI updates
  useEffect(() => {
    if (user) {
      const forceUpdate = setTimeout(() => {
        console.log('AuthContext - Force update completed')
      }, 0)
      return () => clearTimeout(forceUpdate)
    }
  }, [user])

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
      // Get old value before updating
      const oldValue = localStorage.getItem('user')
      
      localStorage.setItem('user', JSON.stringify(userInfo))
      localStorage.setItem('accessToken', accessToken)
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken)
      }
      document.cookie = `accessToken=${accessToken}; path=/; max-age=86400; SameSite=Lax`
      if (refreshToken) {
        document.cookie = `refreshToken=${refreshToken}; path=/; max-age=604800; SameSite=Lax`
      }
      // Dispatch custom event for same-tab updates
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'user',
        newValue: JSON.stringify(userInfo),
        oldValue: oldValue,
        storageArea: localStorage
      }))
      
    }
    // Update React state
    setUser(userInfo)
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
