'use client'

import { useState } from 'react'
import { FaSearch, FaChevronDown } from 'react-icons/fa'

const SearchBar = () => {
  const [showCategories, setShowCategories] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="w-full md:max-w-2xl">
      <div className="relative flex items-center h-12 bg-white rounded-md shadow-sm overflow-hidden">
        {/* Categories Dropdown */}
        <div className="relative flex-shrink-0 h-full">
          <button
            onClick={() => setShowCategories(!showCategories)}
            className="h-full bg-[#BA8B4E] text-white text-[14px] font-semibold px-4 flex items-center hover:bg-[#A87D45] transition-colors cursor-pointer"
          >
            ALL CATEGORIES
            <FaChevronDown
              className={`ml-2 text-[10px] transition-transform duration-200 ${showCategories ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown Menu */}
          {showCategories && (
            <div
              className="absolute left-0 top-full mt-0 w-56 bg-white rounded-b-md shadow-lg z-50 border border-gray-100"
              onMouseLeave={() => setShowCategories(false)}
            >
              <div className="py-1">
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100"
                >
                  All Products
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100"
                >
                  New Arrivals
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100"
                >
                  Best Sellers
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Special Offers
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Search Input */}
        <div className="flex-1 h-full min-w-0">
          <input
            type="text"
            className="w-full h-full pl-3 pr-2 text-sm focus:outline-none placeholder-gray-400"
            placeholder="Search Products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Search Button */}
        <button className="h-full bg-[#BA8B4E] text-white px-4 flex items-center justify-center hover:bg-[#A87D45] transition-colors cursor-pointer">
          <FaSearch className="text-base" />
        </button>
      </div>
    </div>
  )
}

export default SearchBar
