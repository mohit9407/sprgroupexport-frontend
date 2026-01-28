import './globals.css'
import { Montserrat } from 'next/font/google'
import { AuthProvider } from '@/context/AuthContext'
import { Toaster } from '@/utils/toastConfig'
import { Providers } from './providers'

export const metadata = {
  title: 'SPR GROUP EXPORT',
  description: 'spr group export ecommerce platform',
  icons: {
    icon: '/spr_logo.png',
  },
}

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
  weight: ['400', '500', '600', '700'],
})

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${montserrat.variable} font-sans`}>
      <body className="min-h-screen bg-gray-50">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
