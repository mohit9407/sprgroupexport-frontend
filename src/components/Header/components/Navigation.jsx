'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FaChevronDown } from 'react-icons/fa'
import { navItems } from '@/utils/navigation'
import CatalogDropdown from './CatalogDropdown'

const Navigation = () => {
  const [showCatalogDropdown, setShowCatalogDropdown] = useState(false)
  const [activeSubmenu, setActiveSubmenu] = useState(null)

  return (
    <nav className="hidden md:block text-white pb-[20px]">
      <div className="max-w-7xl mx-auto h-16 justify-center items-center px-4 bg-[#BA8B4E]">
        <ul className="flex justify-start space-x-8 py-3">
          {navItems.map((item) => (
            <li
              key={item.name}
              className="p-2 relative group"
              onMouseEnter={() =>
                item.hasDropdown && setShowCatalogDropdown(true)
              }
              onMouseLeave={() => {
                if (item.hasDropdown) {
                  setShowCatalogDropdown(false)
                  setActiveSubmenu(null)
                }
              }}
            >
              <Link
                href={item.href}
                className="text-[14px] font-semibold uppercase hover:opacity-90 flex items-center tracking-wide"
              >
                {item.name}
                {item.hasDropdown && <FaChevronDown className="ml-1 text-xs" />}
              </Link>

              {item.name === 'CATALOG' && (
                <CatalogDropdown
                  isOpen={showCatalogDropdown}
                  onMouseEnter={() => setShowCatalogDropdown(true)}
                  onMouseLeave={() => setShowCatalogDropdown(false)}
                />
              )}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}

export default Navigation
