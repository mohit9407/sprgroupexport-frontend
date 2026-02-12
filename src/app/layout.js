import './globals.css'
import { Montserrat } from 'next/font/google'
import { Toaster } from '@/utils/toastConfig'
import { Providers } from './providers'
import api from '@/lib/axios'

export async function generateMetadata() {
  try {
    const resp = await api.get('/seo-content/get-all')
    const settings = await api.get('/settings/get-all')
    const seo = resp.data?.[0]
    const settingsData = settings.data?.[0]
    if (!seo || !settingsData) {
      return {
        title: settingsData.siteNameOrLogo,
        description: settingsData.contactUsDescription,
      }
    }

    return {
      title: settingsData.siteNameOrLogo,
      description: seo.description || '',
      keywords: seo.keywords || '',
      icons: {
        icon: settingsData.favicon,
      },
    }
  } catch (err) {
    console.error('SEO metadata error:', err)

    return {
      title: 'SPR GROUP EXPORT',
      description: 'spr group export ecommerce platform',
      icons: {
        icon: settingsData.favicon,
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
