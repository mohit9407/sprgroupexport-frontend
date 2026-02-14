'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const Navigation = () => {
  const pathname = usePathname()

  const navItems = [
    { name: 'HOME', href: '/' },
    { name: 'CATALOG', href: '/catalog' },
    { name: 'ABOUT US', href: '/about-us' },
    { name: 'CONTACT US', href: '/contact' },
  ]

  return (
    <nav className="hidden md:flex justify-center py-3 border-t">
      <ul className="flex space-x-8">
        {navItems.map((item) => (
          <li key={item.name}>
            <Link
              href={item.href}
              className={`${
                pathname === item.href
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-700 hover:text-blue-600'
              } font-medium text-sm uppercase pb-2`}
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default Navigation
