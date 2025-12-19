'use client'

import { Geist, Geist_Mono } from 'next/font/google'
import { Provider } from 'react-redux'
import { store } from './store'
import { AuthProvider } from '@/context/AuthContext'
import Header from '@/components/Header'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export default function ClientLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-gray-50">
        <Provider store={store}>
          <AuthProvider>
            <Header />
            <main className="flex-1">{children}</main>
          </AuthProvider>
        </Provider>
      </body>
    </html>
  )
}
