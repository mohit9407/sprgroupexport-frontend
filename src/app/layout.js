import './globals.css'
import { Montserrat } from 'next/font/google'
import { Toaster } from '@/utils/toastConfig'
import { Providers } from './providers'
import api from '@/lib/axios'

export async function generateMetadata() {
  try {
    const resp = await api.get('/seo-content/get-all')
    const seo = resp.data?.[0]

    if (!seo) {
      return {
        title: 'SPR GROUP EXPORT',
        description: 'spr group export ecommerce platform',
      }
    }

    return {
      title: seo.title,
      description: seo.description || '',
      keywords: seo.keywords || '',
      icons: {
        icon: '/spr_logo.png',
      },
    }
  } catch (err) {
    console.error('SEO metadata error:', err)

    return {
      title: 'SPR GROUP EXPORT',
      description: 'spr group export ecommerce platform',
      icons: {
        icon: '/spr_logo.png',
      },
    }
  }
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
