'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  FaSearch,
  FaHeart,
  FaShoppingBag,
  FaUser,
  FaTimes,
  FaChevronDown,
  FaPhoneAlt,
  FaBars,
} from 'react-icons/fa'

const Header = () => {
  const [showNotification, setShowNotification] = useState(true)
  const [showAccountDropdown, setShowAccountDropdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const navItems = [
    { name: 'HOME', href: '/' },
    { name: 'CATALOG', href: '/catalog' },
    { name: 'ABOUT US', href: '/about' },
    { name: 'CONTACT US', href: '/contact' },
  ]

  return (
    <header className="w-full font-sans bg-white">
      {showNotification && (
        <div className="text-[#333] py-2">
          <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
            <div className="flex items-center justify-center flex-1">
              <span className="text-xl">
                Get <b>UPTO 5% OFF</b> on your 1st order
              </span>
              <Link href="#" className="ml-2 underline text-base">
                More details
              </Link>
            </div>
            <button
              onClick={() => setShowNotification(false)}
              className="text-gray-500 hover:text-gray-700 ml-4"
              aria-label="Close notification"
            >
              <FaTimes className="text-lg" />
            </button>
          </div>
        </div>
      )}

      {/* Main Header */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          {/* Top Bar with Contact and Account */}
          <div className="flex justify-end items-center py-2">
            <div className="flex items-center space-x-6">
              <div className="hidden md:flex items-center text-gray-700 text-sm">
                <FaPhoneAlt className="mr-2 text-[#BA8B4E] text-sm" />
                <span>+91 1234567890</span>
              </div>

              <div className="relative">
                <button
                  className="flex items-center text-[#BA8B4E] text-sm hover:opacity-90"
                  onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                >
                  <FaUser className="mr-1.5 text-sm" />
                  <span>My Account</span>
                  <FaChevronDown className="ml-1 text-[10px] mt-0.5" />
                </button>

                {showAccountDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-sm shadow-lg py-1 z-50 border border-gray-200">
                    <Link
                      href="/account"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      My Profile
                    </Link>
                    <Link
                      href="/orders"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      My Orders
                    </Link>
                    <Link
                      href="/wishlist"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Wishlist
                    </Link>
                    <Link
                      href="/login"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Logo and Search Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between py-4">
            {/* Logo */}
            <div className="mb-4 md:mb-0 flex items-center">
              <div className="bg-[#2B6CB0] text-white w-12 h-12 flex items-center justify-center rounded-sm mr-3">
                <span className="font-bold text-lg">SPR</span>
              </div>
              <Link href="/" className="hidden md:block">
                <div className="text-base font-bold text-gray-800 uppercase tracking-wide">
                  SHREE PRAMUKH RAJ GROUP OF EXPORT
                </div>
              </Link>
            </div>

            {/* Search Bar */}
            <div className="w-full md:w-1/2 flex mb-4 md:mb-0">
              <div className="relative flex-grow flex">
                <div className="absolute inset-y-0 left-0 flex items-center">
                  <button className="bg-[#BA8B4E] text-white text-[11px] font-medium px-3 h-full flex items-center rounded-l-sm border-r border-[#A87D45]">
                    ALL CATEGORIES
                    <FaChevronDown className="ml-1.5 text-[10px]" />
                  </button>
                </div>
                <input
                  type="text"
                  className="block w-full pl-32 pr-4 py-2 border border-gray-300 focus:outline-none text-sm"
                  placeholder="Search Products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button className="bg-[#BA8B4E] text-white px-4 py-2 rounded-r-sm hover:bg-[#A87D45] transition-colors">
                <FaSearch className="text-sm" />
              </button>
            </div>

            {/* Icons */}
            <div className="flex items-center space-x-6">
              <Link
                href="/wishlist"
                className="relative text-gray-500 hover:text-[#BA8B4E]"
              >
                <FaHeart className="text-xl" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                  0
                </span>
              </Link>
              <Link
                href="/cart"
                className="relative text-gray-500 hover:text-[#BA8B4E]"
              >
                <div className="flex items-center">
                  <FaShoppingBag className="text-xl mr-1" />
                  <span className="bg-[#BA8B4E] text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center -ml-1 -mt-3">
                    0
                  </span>
                </div>
                <div className="text-[10px] text-gray-500 text-center mt-0.5">
                  CART
                </div>
              </Link>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:block bg-[#BA8B4E] text-white">
            <div className="max-w-5xl mx-auto">
              <ul className="flex justify-center space-x-8 py-3">
                {navItems.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-xs font-medium uppercase hover:opacity-90 flex items-center tracking-wide"
                    >
                      {item.name}
                      {item.name === 'CATALOG' && (
                        <FaChevronDown className="ml-1 text-[10px] mt-0.5" />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="bg-gray-100 py-2 px-4 border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-xs text-gray-600">
            <Link href="/" className="hover:text-[#BA8B4E]">
              Home
            </Link>
            <span className="mx-1">»</span>
            <span className="text-gray-700 font-medium">Shop</span>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
