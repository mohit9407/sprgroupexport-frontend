import Header from '@/components/Header'
import Footer from '@/components/Footer/Footer'

export default function UserLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-grow w-full mx-auto">{children}</main>
      <Footer />
    </div>
  )
}
