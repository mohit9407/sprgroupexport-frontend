'use client'

import { createContext, useContext, useState, useEffect } from 'react'

const WishlistContext = createContext({})

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(() => {
    if (typeof window === 'undefined') return []
    try {
      const stored = localStorage.getItem('wishlist')
      return stored ? JSON.parse(stored) : []
    } catch (e) {
      return []
    }
  })
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [pendingProduct, setPendingProduct] = useState(null)
  const [authMode, setAuthMode] = useState('phone') // 'phone' or 'email'

  // Update localStorage when wishlist changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('wishlist', JSON.stringify(wishlist))
    }
  }, [wishlist])

  const addToWishlist = (product, isAuthenticated = false) => {
    if (!isAuthenticated) {
      setPendingProduct(product)
      setShowAuthModal(true)
      return false
    }

    setWishlist((prev) => {
      const exists = prev.some((item) => item.id === product.id)
      if (exists) return prev
      return [...prev, product]
    })
    return true
  }

  const removeFromWishlist = (productId) => {
    setWishlist((prev) => prev.filter((item) => item.id !== productId))
  }

  const isInWishlist = (productId) => {
    return wishlist.some((item) => item.id === productId)
  }

  const handleAuthSuccess = () => {
    if (pendingProduct) {
      addToWishlist(pendingProduct, true)
      setPendingProduct(null)
    }
    setShowAuthModal(false)
  }

  const switchToEmail = () => {
    setAuthMode('email')
  }

  const switchToPhone = () => {
    setAuthMode('phone')
  }

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        wishlistCount: wishlist.length,
        showAuthModal,
        setShowAuthModal,
        handleAuthSuccess,
        authMode,
        switchToEmail,
        switchToPhone,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}
