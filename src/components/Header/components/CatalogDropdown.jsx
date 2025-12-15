'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FaChevronDown } from 'react-icons/fa'

const CatalogDropdown = ({
  isOpen,
  onMouseEnter,
  onMouseLeave,
  className = '',
}) => {
  const [activeSubmenu, setActiveSubmenu] = useState(null)

  const handleMouseEnter = () => {
    onMouseEnter()
  }

  const handleMouseLeave = () => {
    onMouseLeave()
    setActiveSubmenu(null)
  }

  if (!isOpen) return null

  return (
    <div
      className={`absolute left-0 mt-0 w-48 bg-white shadow-lg z-50 border border-gray-200 ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Women with submenu */}
      <div
        className="relative group"
        onMouseEnter={() => setActiveSubmenu('women')}
        onMouseLeave={() => setActiveSubmenu(null)}
      >
        <Link
          href="/catalog/women"
          className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <span>Women</span>
          <FaChevronDown className="text-xs text-gray-400" />
        </Link>

        {activeSubmenu === 'women' && (
          <div className="absolute left-full top-0 w-48 bg-white border-l-0 border border-gray-200 shadow-lg">
            <Link
              href="/catalog/women/platinum"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Platinum
            </Link>
            <Link
              href="/catalog/women/diamond"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Diamond
            </Link>
            <Link
              href="/catalog/women/gold"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Gold
            </Link>
            <Link
              href="/catalog/women/necklace"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Necklace
            </Link>
          </div>
        )}
      </div>

      {/* Men with submenu */}
      <div
        className="relative group"
        onMouseEnter={() => setActiveSubmenu('men')}
        onMouseLeave={() => setActiveSubmenu(null)}
      >
        <Link
          href="/catalog/men"
          className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <span>Men</span>
          <FaChevronDown className="text-xs text-gray-400" />
        </Link>

        {activeSubmenu === 'men' && (
          <div className="absolute left-full top-0 w-48 bg-white border-l-0 border border-gray-200 shadow-lg">
            <Link
              href="/catalog/men/gold"
              className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <span>Gold</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default CatalogDropdown
