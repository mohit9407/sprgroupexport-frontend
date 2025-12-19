'use client'

import { createContext, useContext, useState, useEffect } from 'react'

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
  const [cartCount, setCartCount] = useState(() =>
    initialCart.reduce((total, item) => total + (item.quantity || 0), 0),
  )

  // Update cart count
  const updateCartCount = (cartItems) => {
    const count = cartItems.reduce((total, item) => total + item.quantity, 0)
    setCartCount(count)
  }

  // Add item to cart
  const addToCart = (product, quantity = 1) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (item) => item.id === product.id,
      )
      let newCart

      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        newCart = [...prevCart]
        newCart[existingItemIndex] = {
          ...newCart[existingItemIndex],
          quantity: newCart[existingItemIndex].quantity + quantity,
        }
      } else {
        // Add new item
        newCart = [...prevCart, { ...product, quantity }]
      }

      // Save to localStorage
      localStorage.setItem('cart', JSON.stringify(newCart))
      updateCartCount(newCart)
      return newCart
    })
  }

  // Remove item from cart
  const removeFromCart = (productId) => {
    setCart((prevCart) => {
      const newCart = prevCart.filter((item) => item.id !== productId)
      localStorage.setItem('cart', JSON.stringify(newCart))
      updateCartCount(newCart)
      return newCart
    })
  }

  // Update item quantity
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return

    setCart((prevCart) => {
      const newCart = prevCart.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item,
      )
      localStorage.setItem('cart', JSON.stringify(newCart))
      updateCartCount(newCart)
      return newCart
    })
  }

  // Clear cart
  const clearCart = () => {
    setCart([])
    localStorage.removeItem('cart')
    setCartCount(0)
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
        addToCart,
        removeFromCart,
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
