'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { cartService } from '@/services/cartService'

const CartContext = createContext({})

export function CartProvider({ children }) {
  const initialCart = (() => {
    try {
      const saved = localStorage.getItem('cart')
      return saved ? JSON.parse(saved) : []
    } catch (e) {
      return []
    }
  })()

  const [cart, setCart] = useState(initialCart)
  const [cartCount, setCartCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Update cart count
  const updateCartCount = (cartItems) => {
    const count = cartItems.reduce((total, item) => total + item.quantity, 0)
    setCartCount(count)
  }

  // Add item to cart
  const addToCart = async (product, quantity = 1) => {
    setIsLoading(true)
    setError(null)
    try {
      // Use _id if available, otherwise fall back to id
      const productId = product._id || product.id
      await cartService.addToCart(productId, quantity)

      // Update local state on success
      setCart((prevCart) => {
        const existingItemIndex = prevCart.findIndex(
          (item) => (item._id || item.id) === productId,
        )
        let newCart

        if (existingItemIndex >= 0) {
          // Update quantity if item exists
          newCart = [...prevCart]
          newCart[existingItemIndex] = {
            ...newCart[existingItemIndex],
            _id: productId, // Ensure _id is set
            id: productId, // Keep id for backward compatibility
            quantity: newCart[existingItemIndex].quantity + quantity,
          }
        } else {
          // Add new item with proper ID mapping
          newCart = [
            ...prevCart,
            {
              ...product,
              _id: productId, // Ensure _id is set
              id: productId, // Keep id for backward compatibility
              quantity,
            },
          ]
        }

        // Update local storage and cart count
        localStorage.setItem('cart', JSON.stringify(newCart))
        updateCartCount(newCart)
        return newCart
      })
    } catch (err) {
      console.error('Error adding to cart:', err)
      setError(err.message || 'Failed to add item to cart')
      return prevCart
    } finally {
      setIsLoading(false)
    }
  }

  // Remove item from cart
  const removeFromCart = async (productId) => {
    setIsLoading(true)
    setError(null)
    try {
      await cartService.removeFromCart(productId)

      // Update local state on success
      setCart((prevCart) => {
        const newCart = prevCart.filter((item) => item.id !== productId)
        localStorage.setItem('cart', JSON.stringify(newCart))
        updateCartCount(newCart)
        return newCart
      })
    } catch (err) {
      console.error('Error removing from cart:', err)
      setError(err.message || 'Failed to remove item from cart')
      return prevCart
    } finally {
      setIsLoading(false)
    }
  }

  // Update item quantity
  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return
    setIsLoading(true)
    setError(null)
    try {
      const product = cart.find((item) => item.id === productId)
      if (!product) return

      // Calculate the difference to update the server
      const quantityDifference = newQuantity - (product.quantity || 0)

      if (quantityDifference > 0) {
        await cartService.addToCart(productId, quantityDifference)
      } else if (quantityDifference < 0) {
        // For simplicity, we'll remove and re-add with the correct quantity
        // In a real app, you might want to implement a dedicated update endpoint
        await cartService.removeFromCart(productId)
        if (newQuantity > 0) {
          await cartService.addToCart(productId, newQuantity)
        }
      }

      // Update local state
      setCart((prevCart) => {
        const newCart = prevCart.map((item) =>
          item.id === productId ? { ...item, quantity: newQuantity } : item,
        )
        localStorage.setItem('cart', JSON.stringify(newCart))
        updateCartCount(newCart)
        return newCart
      })
    } catch (err) {
      console.error('Error updating quantity:', err)
      setError(err.message || 'Failed to update item quantity')
      return prevCart
    } finally {
      setIsLoading(false)
    }
  }

  // Clear cart
  const clearCart = () => {
    setCart([])
    setCartCount(0)
    localStorage.removeItem('cart')
  }

  // Remove all items from cart
  const removeAllFromCart = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await cartService.removeAllFromCart()
      // Update local state on success
      setCart([])
      setCartCount(0)
      localStorage.removeItem('cart')
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
  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      return total + item.price * item.quantity
    }, 0)
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        isLoading,
        error,
        addToCart,
        removeFromCart,
        removeAllFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
