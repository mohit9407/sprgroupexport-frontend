'use client'

import { useState } from 'react'
import { FaChevronDown } from 'react-icons/fa'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

const AccountDropdown = () => {
  const [showDropdown, setShowDropdown] = useState(false)
  const { logout } = useAuth()

  const handleLogout = (e) => {
    e.preventDefault()
    logout()
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowDropdown(true)}
      onMouseLeave={() => setShowDropdown(false)}
    >
      <button
        className="flex items-center text-white text-sm font-medium hover:opacity-90 focus:outline-none cursor-pointer py-2"
        aria-expanded={showDropdown}
        aria-haspopup="true"
      >
        <span className="font-bold">My Account</span>
        <FaChevronDown className="ml-1 text-xs mt-0.5" />
      </button>

      <div
        className={`absolute right-0 mt-2 w-48 bg-white rounded-sm shadow-lg py-1 z-50 border border-gray-200 transition-all duration-200 ${showDropdown ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
      >
        <Link
          href="/account"
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          My Profile
        </Link>
        <Link
          href="/orders"
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          My Orders
        </Link>
        <Link
          href="/wishlist"
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Wishlist
        </Link>
        <div className="border-t border-gray-200 my-1"></div>
        <button
          onClick={handleLogout}
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer w-full text-left"
        >
          Logout
        </button>
      </div>
    </div>
  )
}

export default AccountDropdown
