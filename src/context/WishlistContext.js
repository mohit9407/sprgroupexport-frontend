'use client'

import {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
  useCallback,
} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { api } from '@/lib/axios'
import { useAuth } from './AuthContext'
import { getUserById } from '@/features/user/userSlice'

const WishlistContext = createContext({})

export function WishlistProvider({ children }) {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.user)
  const { items: allProducts } = useSelector((state) => state.products)
  const { isAuthenticated } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [pendingProduct, setPendingProduct] = useState(null)
  const [authMode, setAuthMode] = useState('phone') // 'phone' or 'email'

  // State to track wishlist items locally for immediate feedback
  const [localWishlist, setLocalWishlist] = useState([])

  // Memoized derived wishlist products from Redux store
  const derivedWishlist = useMemo(() => {
    if (!allProducts) return []

    const storedUser =
      typeof window !== 'undefined' ? localStorage.getItem('user') : null
    const userId = storedUser ? JSON.parse(storedUser)?.id : null

    // Get products from user's wishlist (if any)
    const wishlistProducts =
      user?.wishlist
        ?.map((wishlistItem) => {
          const product = allProducts.find(
            (p) => p._id === wishlistItem.productId,
          )
          return product
            ? {
                id: product._id,
                name: product.productName || 'Product',
                price: product.price || 0,
                image:
                  product.image ||
                  product.images?.[0] ||
                  '/placeholder-product.jpg',
                ...product,
              }
            : null
        })
        .filter(Boolean) || []

    // Get products the user has liked (from the likes array in each product)
    const likedProducts = allProducts
      .filter(
        (product) =>
          product.likes && product.likes.some((like) => like.userId === userId),
      )
      .map((product) => ({
        id: product._id,
        name: product.productName || 'Product',
        price: product.price || 0,
        image:
          product.image || product.images?.[0] || '/placeholder-product.jpg',
        ...product,
      }))

    // Merge both arrays and remove duplicates
    const merged = [...wishlistProducts, ...likedProducts]
    const uniqueMerged = merged.filter(
      (product, index, self) =>
        index === self.findIndex((p) => p.id === product.id),
    )

    return uniqueMerged
  }, [user?.wishlist, allProducts])

  // Sync derived wishlist into local state when it changes
  useEffect(() => {
    let timer
    if (JSON.stringify(derivedWishlist) !== JSON.stringify(localWishlist)) {
      timer = setTimeout(() => setLocalWishlist(derivedWishlist), 0)
    }
    return () => clearTimeout(timer)
  }, [derivedWishlist, localWishlist])

  // Expose the effective wishlist (prefer local optimistic updates)
  const wishlist = localWishlist.length > 0 ? localWishlist : derivedWishlist

  // Fetch user data when authentication status changes
  useEffect(() => {
    if (isAuthenticated) {
      const storedUser =
        typeof window !== 'undefined' ? localStorage.getItem('user') : null
      const userId = storedUser ? JSON.parse(storedUser)?.id : null

      if (userId) {
        dispatch(getUserById(userId)).catch(console.error)
      }
    }
  }, [isAuthenticated, dispatch])

  const addToWishlist = async (product, isUserAuthenticated = false) => {
    if (!isUserAuthenticated) {
      setPendingProduct(product)
      setShowAuthModal(true)
      return false
    }

    try {
      // Optimistically update local state
      setLocalWishlist((prev) => {
        if (prev.some((item) => item.id === product.id)) return prev
        return [...prev, product]
      })

      await api.post(`/product/${product.id}/like`)
      const storedUser =
        typeof window !== 'undefined' ? localStorage.getItem('user') : null
      const userId = storedUser ? JSON.parse(storedUser)?.id : null

      if (userId) {
        await dispatch(getUserById(userId))
      }

      return true
    } catch (error) {
      console.error('Error adding to wishlist:', error)
      // Revert optimistic update on error
      setLocalWishlist((prev) => prev.filter((item) => item.id !== product.id))
      return false
    }
  }

  const removeFromWishlist = async (productId) => {
    try {
      // Optimistically update local state
      setLocalWishlist((prev) => prev.filter((item) => item.id !== productId))

      await api.post(`/product/${productId}/unlike`)

      // Force a refresh of the user data to ensure consistency
      const storedUser =
        typeof window !== 'undefined' ? localStorage.getItem('user') : null
      const userId = storedUser ? JSON.parse(storedUser)?.id : null

      if (userId) {
        // Force a fresh fetch of user data
        await dispatch(getUserById(userId))
        // Force a re-render by updating the local state again
        setLocalWishlist((prev) => {
          const updated = prev.filter((item) => item.id !== productId)
          return updated
        })
      }

      return true
    } catch (error) {
      console.error('Error removing from wishlist:', error)

      // Re-fetch the wishlist from the server to ensure consistency
      if (error.response?.status !== 401) {
        const storedUser =
          typeof window !== 'undefined' ? localStorage.getItem('user') : null
        const userId = storedUser ? JSON.parse(storedUser)?.id : null
        if (userId) {
          await dispatch(getUserById(userId))
        }
        // Update local state after re-fetch
        setLocalWishlist((prev) => {
          const updated = [...prev]
          return updated
        })
      }
      return false
    }
  }

  const isInWishlist = useCallback(
    (productId) => {
      return wishlist.some((item) => item.id === productId)
    },
    [wishlist],
  )

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

  // Calculate wishlist count
  const wishlistCount = wishlist.length

  const value = {
    wishlist,
    wishlistCount, // Add wishlistCount to context value
    addToWishlist,
    removeFromWishlist,
    showAuthModal,
    setShowAuthModal,
    pendingProduct,
    authMode,
    setAuthMode,
    isInWishlist,
    handleAuthSuccess,
    switchToEmail,
    switchToPhone,
  }

  return (
    <WishlistContext.Provider value={value}>
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
