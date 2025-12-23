'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  FaSearch,
  FaRegHeart,
  FaShoppingBag,
  FaChevronDown,
} from 'react-icons/fa'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { navItems } from '@/utils/navigation'
import CatalogDropdown from './CatalogDropdown'
import AccountDropdown from './AccountDropdown'

const StickyHeader = () => {
  const { cartCount } = useCart()
  const { wishlistCount } = useWishlist()
  const [isVisible, setIsVisible] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [showCatalogDropdown, setShowCatalogDropdown] = useState(false)
  const [isScrollingDown, setIsScrollingDown] = useState(false)

  useEffect(() => {
    let timeoutId

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const isScrollingDownNow =
        currentScrollY > lastScrollY && currentScrollY > 0

      // Update scrolling direction
      if (isScrollingDownNow !== isScrollingDown) {
        setIsScrollingDown(isScrollingDownNow)
      }

      // Show header when scrolled down past 200px, regardless of scroll direction
      if (currentScrollY > 200) {
        setIsVisible(true)
      }
      // Hide header when at the top of the page
      else if (currentScrollY <= 0) {
        setIsVisible(false)
      }

      // Update last scroll position with debounce
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        setLastScrollY(currentScrollY)
      }, 100)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY, isScrollingDown])

  return (
    <div
      className={`fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-md z-2 transition-all duration-500 ease-in-out transform ${
        isVisible
          ? 'translate-y-0 opacity-100'
          : '-translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 h-full">
        <div className="flex items-center justify-between h-[85px]">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 h-full flex items-center">
            <Image
              src="/spr_logo.png"
              alt="SPR Group of Export"
              width={120}
              height={20}
              priority
            />
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center h-full space-x-8">
            {navItems.map((item) => (
              <div
                key={item.name}
                className="relative group"
                onMouseEnter={() =>
                  item.hasDropdown && setShowCatalogDropdown(true)
                }
                onMouseLeave={() =>
                  item.hasDropdown && setShowCatalogDropdown(false)
                }
              >
                <Link
                  href={item.href}
                  className="flex items-center text-sm font-medium hover:text-[#BA8B4E] transition-colors"
                >
                  {item.name}
                  {item.hasDropdown && (
                    <FaChevronDown className="ml-1 text-xs" />
                  )}
                </Link>

                {item.hasDropdown && (
                  <CatalogDropdown
                    isOpen={showCatalogDropdown}
                    onMouseEnter={() => setShowCatalogDropdown(true)}
                    onMouseLeave={() => setShowCatalogDropdown(false)}
                    className={!showCatalogDropdown ? 'hidden' : ''}
                  />
                )}
              </div>
            ))}
          </nav>

          {/* Icons */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <Link
              href="/search"
              className="p-2 rounded-full bg-[#ced4da] hover:bg-gray-200 transition-colors relative"
            >
              <FaSearch className="text-lg" />
            </Link>

            {/* User/Sign In */}
            <div className="relative">
              <AccountDropdown showIcon={true} />
            </div>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="p-2 rounded-full bg-[#ced4da] hover:bg-gray-200 transition-colors relative"
            >
              <FaRegHeart className="text-lg" />
              <span className="absolute -top-1 -right-1 bg-[#BA8B4E] text-white text-[10px] rounded-full h-5 w-5 flex items-center justify-center">
                {wishlistCount}
              </span>
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="p-2 rounded-full bg-[#ced4da] hover:bg-gray-200 transition-colors relative"
            >
              <FaShoppingBag className="text-lg" />
              <span className="absolute -top-1 -right-1 bg-[#BA8B4E] text-white text-[10px] rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StickyHeader
