'use client'

import { useState } from 'react'
import { FaChevronDown, FaUserAlt } from 'react-icons/fa'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

const AccountDropdown = ({ showIcon = true }) => {
  const [showDropdown, setShowDropdown] = useState(false)
  const { user, logout } = useAuth()

  const handleLogout = (e) => {
    e.preventDefault()
    logout()
  }

  // If user is not logged in, show login/signup buttons
  if (!user) {
    if (!showIcon) {
      return (
        <div className="flex items-center space-x-3">
          <Link
            href="/login"
            className="px-5 py-2 text-sm font-medium text-[#BA8B4E] bg-white hover:bg-gray-50 transition-colors rounded-md border border-[#BA8B4E]"
          >
            LOGIN
          </Link>
          <Link
            href="/signup"
            className="px-5 py-2 text-sm font-medium text-white bg-[#BA8B4E] hover:bg-[#9a7542] transition-colors rounded-md"
          >
            SIGN UP
          </Link>
        </div>
      )
    }
    return (
      <Link
        href="/login"
        className="p-2 rounded-full bg-[#ced4da] hover:bg-gray-200 transition-colors relative flex items-center justify-center"
      >
        <FaUserAlt className="text-lg" />
      </Link>
    )
  }

  // If user is logged in, show account dropdown
  return (
    <div
      className={`relative ${!showIcon ? 'h-full flex items-center' : ''}`}
      onMouseEnter={() => setShowDropdown(true)}
      onMouseLeave={() => setShowDropdown(false)}
    >
      <button
        className={`flex items-center ${showIcon ? 'p-2 rounded-full bg-[#ced4da] hover:bg-gray-200' : ''} transition-colors relative`}
        aria-expanded={showDropdown}
        aria-haspopup="true"
      >
        {showIcon ? (
          <FaUserAlt className="text-lg" />
        ) : (
          <span className="flex items-center text-white text-sm font-medium hover:opacity-90 focus:outline-none cursor-pointer py-2">
            <span className="font-bold">My Account</span>
            <FaChevronDown className="ml-1 text-xs mt-0.5" />
          </span>
        )}
      </button>

      <div
        className={`absolute right-0 mt-2 w-48 bg-white rounded-sm shadow-lg py-1 z-50 border border-gray-200 transition-all duration-200 ${showDropdown ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        style={{ top: '100%' }}
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
        <Link
          href="/shipping-address"
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Shipping Address
        </Link>
        <Link
          href="/change-password"
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Change Passwoard
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
