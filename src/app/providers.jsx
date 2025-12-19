'use client'

import { Provider } from 'react-redux'
import { store } from './store'
import { CartProvider } from '@/context/CartContext'
import { WishlistProvider } from '@/context/WishlistContext'

export function Providers({ children }) {
  return (
    <Provider store={store}>
      <CartProvider>
        <WishlistProvider>{children}</WishlistProvider>
      </CartProvider>
    </Provider>
  )
}
