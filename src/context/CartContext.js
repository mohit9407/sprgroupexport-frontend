'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { cartService } from '@/services/cartService'
import { useAuth } from './AuthContext'

const CartContext = createContext({})

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])
  const [cartCount, setCartCount] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [directCheckoutItem, setDirectCheckoutItem] = useState(null)

  // Transform API response to cart format
  const transformCartData = (response) => {
    if (!Array.isArray(response)) return [];
    
    return response
      .filter(item => item?.product?._id) // Filter out items with missing product or product._id
      .map(item => ({
        id: item.product._id,
        _id: item.product._id,
        name: item.product.productName,
        price: item.product.price,
        image: item.product.image,
        brand: item.product.brand || '',
        quantity: item.quantity,
        product: item.product
      }));
  }

  // Update cart count
  const updateCartCount = (cartItems) => {
    const count = cartItems.reduce((total, item) => total + (item.quantity || 1), 0)
    setCartCount(count)
  }

  // Fetch cart data from API
  const fetchCart = async () => {
    setIsLoading(true)
    try {
      const response = await cartService.getCart()
      const formattedCart = transformCartData(response)
      setCart(formattedCart)
      updateCartCount(formattedCart)
      return formattedCart
    } catch (err) {
      console.error('Error fetching cart:', err)
      setError(err.message || 'Failed to load cart')
      setCart([])
      return []
    } finally {
      setIsLoading(false)
    }
  }

  // Add item to cart
  const addToCart = async (product, quantity = 1) => {
    setIsLoading(true)
    setError(null)
    try {
      const productId = product._id || product.id
      await cartService.addToCart(productId, quantity)

      // Optimistically update the cart
      setCart(prevCart => {
        const existingItem = prevCart.find(item => item.id === productId)
        let newCart
        if (existingItem) {
          newCart = prevCart.map(item =>
            item.id === productId
              ? { ...item, quantity: (item.quantity || 1) + quantity }
              : item
          )
        } else {
          newCart = [...prevCart, {
            ...product,
            id: productId,
            _id: productId,
            quantity
          }]
        }
        updateCartCount(newCart)
        return newCart
      })

      // Then sync with server
      return await fetchCart()
    } catch (err) {
      console.error('Error adding to cart:', err)
      setError(err.message || 'Failed to add item to cart')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Remove item from cart
  const removeFromCart = async (productId) => {
    setIsLoading(true)
    setError(null)
    try {
      // Optimistically update the cart
      setCart(prevCart => {
        const newCart = prevCart.filter(item => item.id !== productId)
        updateCartCount(newCart)
        return newCart
      })

      await cartService.removeFromCart(productId)
      return await fetchCart()
    } catch (err) {
      console.error('Error removing from cart:', err)
      setError(err.message || 'Failed to remove item from cart')
      // Revert on error
      fetchCart()
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Update item quantity
  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      // If quantity is less than 1, remove the item
      return await removeFromCart(productId);
    }

    setIsLoading(true)
    setError(null)
    try {
      // First make the appropriate API call based on whether we're increasing or decreasing quantity
      const currentItem = cart.find(item => item.id === productId);
      if (currentItem) {
        if (newQuantity > currentItem.quantity) {
          // If increasing quantity, use addToCart with the difference
          const quantityToAdd = newQuantity - currentItem.quantity;
          await cartService.addToCart(productId, quantityToAdd);
        } else if (newQuantity < currentItem.quantity) {
          // If decreasing quantity, use removeFromCart for single unit
          await cartService.removeFromCart(productId);
          // If still quantity left after decreasing, add back the remaining
          if (newQuantity > 0) {
            await cartService.addToCart(productId, newQuantity);
          }
        }
      }

      // Then update the local state
      setCart(prevCart => {
        const newCart = prevCart.map(item =>
          item.id === productId
            ? { ...item, quantity: newQuantity }
            : item
        ).filter(item => item.quantity > 0); // Remove items with quantity <= 0

        updateCartCount(newCart)
        return newCart
      })

      // Return the updated cart
      return cart;
    } catch (err) {
      console.error('Error updating quantity:', err)
      setError(err.message || 'Failed to update item quantity')
      // Revert on error by refetching the cart from the server
      await fetchCart()
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Clear cart
  const clearCart = async () => {
    setIsLoading(true)
    try {
      // Optimistically clear the cart
      setCart([])
      setCartCount(0)

      await cartService.removeAllFromCart()
    } catch (err) {
      console.error('Error clearing cart:', err)
      setError(err.message || 'Failed to clear cart')
      // Revert on error
      fetchCart()
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Remove all items from cart
  const removeAllFromCart = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await cartService.removeAllFromCart()
      // Refresh cart data from API after clearing
      await fetchCart()
      return { success: true }
    } catch (error) {
      console.error('Failed to remove all items from cart:', error)
      setError(error.message)
      return { success: false, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate cart total
  const getCartTotal = useCallback(() => {
    return cart.reduce((total, item) => {
      return total + (item.price * (item.quantity || 1))
    }, 0)
  }, [cart])

  // Get auth context
  const { user } = useAuth()
  useEffect(() => {
    if (user?.accessToken) {
      fetchCart()
    } else {
      setCart([])
      setCartCount(0)
    }
  }, [user?.accessToken])

  // Add direct checkout item
  const addDirectCheckoutItem = useCallback((item) => {
    setDirectCheckoutItem({
      ...item,
      isDirectCheckout: true
    });
  }, []);

  // Clear direct checkout item
  const clearDirectCheckoutItem = useCallback(() => {
    setDirectCheckoutItem(null);
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        removeAllFromCart,
        isLoading,
        error,
        directCheckoutItem,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        refreshCart: fetchCart,
        addDirectCheckoutItem,
        clearDirectCheckoutItem,
        getCartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
