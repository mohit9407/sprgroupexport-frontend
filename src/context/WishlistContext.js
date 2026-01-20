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
import AuthModal from '@/components/Auth/AuthModal'

const WishlistContext = createContext()

export function WishlistProvider({ children }) {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.user || {})
  const { items: allProducts } = useSelector(
    (state) => state.products || { items: [] },
  )
  const { isAuthenticated } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authModalMode, setAuthModalMode] = useState('email') // 'email' or 'otp'
  const [pendingProduct, setPendingProduct] = useState(null)

  // Initialize local wishlist from localStorage or empty array
  const [localWishlist, setLocalWishlist] = useState(() => {
    if (typeof window === 'undefined') return []
    try {
      const saved = localStorage.getItem('wishlist')
      return saved ? JSON.parse(saved) : []
    } catch (e) {
      console.error('Failed to load wishlist from localStorage', e)
      return []
    }
  })

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

  // Save to localStorage whenever localWishlist changes
  useEffect(() => {
    try {
      if (localWishlist.length > 0) {
        localStorage.setItem('wishlist', JSON.stringify(localWishlist))
      } else {
        localStorage.removeItem('wishlist')
      }
    } catch (e) {
      console.error('Failed to update wishlist in localStorage', e)
    }
  }, [localWishlist])

  // Sync with server when authenticated
  useEffect(() => {
    if (isAuthenticated && user?.wishlist && localWishlist.length === 0) {
      const serverWishlist = user.wishlist.map((item) => ({
        id: item.productId,
        name: item.productName || 'Product',
        price: item.price || 0,
        image: item.image || '/placeholder-product.jpg',
        ...item,
      }))
      const id = setTimeout(() => setLocalWishlist(serverWishlist), 0)
      return () => clearTimeout(id)
    }
  }, [isAuthenticated, user?.wishlist, localWishlist.length])

  // Use localWishlist as the single source of truth
  const wishlist = localWishlist

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
    // Check if product already exists in wishlist
    const productExists = localWishlist.some((item) => item.id === product.id)

    if (productExists) {
      return true // Already in wishlist
    }

    // For unauthenticated users, just update local state
    if (!isUserAuthenticated) {
      const updatedWishlist = [...localWishlist, product]
      setLocalWishlist(updatedWishlist)
      setPendingProduct(product)
      openAuthModal()
      return false
    }

    try {
      // Make API call first for authenticated users
      await api.post(`/product/${product.id}/like`)

      // Update local state on success
      const updatedWishlist = [...localWishlist, product]
      setLocalWishlist(updatedWishlist)

      // Sync with user data if available
      const storedUser = localStorage.getItem('user')
      const userId = storedUser ? JSON.parse(storedUser)?.id : null
      if (userId) {
        await dispatch(getUserById(userId))
      }

      return true
    } catch (error) {
      console.error('Error adding to wishlist:', error)
      return false
    }
  }

  const removeFromWishlist = async (productId) => {
    try {
      // Create updated wishlist without the product
      const updatedWishlist = localWishlist.filter(
        (item) => item.id !== productId,
      )

      // Update state and localStorage in one go
      setLocalWishlist(updatedWishlist)

      // Make API call for authenticated users
      const storedUser = localStorage.getItem('user')
      const userId = storedUser ? JSON.parse(storedUser)?.id : null

      if (userId) {
        await api.post(`/product/${productId}/unlike`)
        await dispatch(getUserById(userId))
      }

      return true
    } catch (error) {
      console.error('Error removing from wishlist:', error)
      // On error, try to restore from localStorage
      try {
        const saved = localStorage.getItem('wishlist')
        setLocalWishlist(saved ? JSON.parse(saved) : [])
      } catch (e) {
        console.error('Error restoring wishlist:', e)
        setLocalWishlist([])
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

  const openAuthModal = useCallback((mode = 'email') => {
    setAuthModalMode(mode)
    setShowAuthModal(true)
  }, [])

  const closeAuthModal = useCallback(() => {
    setShowAuthModal(false)
    // Small delay before resetting to prevent UI flicker
    const timer = setTimeout(() => {
      setAuthModalMode('email')
      setPendingProduct(null)
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  const handleAuthSuccess = useCallback(async () => {
    console.log('WishlistContext - handleAuthSuccess called')
    if (pendingProduct) {
      // First, close the auth modal
      closeAuthModal()

      // Then add the product to wishlist with authenticated flag
      const success = await addToWishlist(pendingProduct, true)

      // If successful, clear the pending product
      if (success) {
        setPendingProduct(null)

        // Force a refresh of the user data to sync the wishlist
        const storedUser = localStorage.getItem('user')
        const userId = storedUser ? JSON.parse(storedUser)?.id : null
        if (userId) {
          await dispatch(getUserById(userId))
        }
      }
    } else {
      closeAuthModal()
    }
  }, [pendingProduct, closeAuthModal, addToWishlist, dispatch])

  const switchToEmail = () => {
    setAuthModalMode('email')
  }

  const switchToPhone = () => {
    setAuthModalMode('phone')
  }

  // Calculate wishlist count
  const wishlistCount = wishlist.length

  const value = useMemo(
    () => ({
      wishlist,
      wishlistCount,
      addToWishlist,
      removeFromWishlist,
      isInWishlist: (productId) =>
        localWishlist.some((item) => item.id === productId),
      showAuthModal,
      setShowAuthModal,
      openAuthModal,
      closeAuthModal,
      authModalMode,
      setAuthModalMode,
    }),
    [
      wishlist,
      localWishlist,
      showAuthModal,
      authModalMode,
      openAuthModal,
      closeAuthModal,
    ],
  )

  return (
    <WishlistContext.Provider value={value}>
      {children}
      <AuthModal
        isOpen={showAuthModal}
        onClose={closeAuthModal}
        switchToEmail={authModalMode === 'email'}
      />
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
