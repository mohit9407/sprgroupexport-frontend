import './globals.css'
import ClientLayout from './client-layout'

export const metadata = {
  title: 'Admin & User Dashboard',
  description: 'A Next.js application with admin and user dashboards',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
