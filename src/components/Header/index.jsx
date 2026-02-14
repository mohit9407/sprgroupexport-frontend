'use client'

import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Image from 'next/image'
import Link from 'next/link'
import { fetchUserOrders } from '@/features/order/orderSlice'

// Import Components
import NotificationBar from './components/NotificationBar'
import AccountDropdown from './components/AccountDropdown'
import SearchBar from './components/SearchBar'
import HeaderIcons from './components/HeaderIcons'
import Navigation from './components/Navigation'
import BreadcrumbsWrapper from './components/BreadcrumbsWrapper'
import StickyHeader from './components/StickyHeader'

const Header = ({ settings = {} }) => {
  const dispatch = useDispatch()
  const { userOrders = [] } = useSelector((state) => state.order)
  const [showNotification, setShowNotification] = useState(false)
  const [showCategories, setShowCategories] = useState(false)
  const [showAccountDropdown, setShowAccountDropdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCatalogDropdown, setShowCatalogDropdown] = useState(false)
  const [activeSubmenu, setActiveSubmenu] = useState(null)

  // Fetch user orders when component mounts
  useEffect(() => {
    dispatch(fetchUserOrders())
  }, [dispatch])

  // Update notification visibility based on order count
  useEffect(() => {
    // Only show notification if user has 0 orders
    setShowNotification(userOrders.length === 0)
  }, [userOrders.length])

  const navItems = [
    { name: 'HOME', href: '/' },
    { name: 'CATALOG', href: '/catalog' },
    { name: 'ABOUT US', href: '/about-us' },
    { name: 'CONTACT US', href: '/contact' },
  ]

  // State for scroll position
  const [scrolled, setScrolled] = useState(false)

  // Add scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 0
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled)
      }
    }

    document.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      document.removeEventListener('scroll', handleScroll)
    }
  }, [scrolled])

  return (
    <>
      {/* Sticky Header that appears on scroll */}
      <StickyHeader />

      <header className={`w-full font-sans bg-white`}>
        {showNotification && (
          <NotificationBar
            showNotification={showNotification}
            onClose={() => setShowNotification(false)}
          />
        )}

        {/* Main Header */}
        <div className="border-b border-gray-200 relative bg-white z-1">
          {/* Top Bar with Contact and Account */}
          <div className="bg-[#BA8B4E] py-1">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex justify-between items-center">
                {/* Contact Info - Empty div for alignment */}
                <div className="flex items-center space-x-4 text-white text-sm"></div>

                {/* Account Section */}
                <AccountDropdown
                  showAccountDropdown={showAccountDropdown}
                  setShowAccountDropdown={setShowAccountDropdown}
                  showIcon={false}
                />
              </div>
            </div>
          </div>

          {/* Main Header Section - Full Width */}
          <div className="w-full bg-white py-6">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                {/* Logo */}
                <Link href="/" className="flex items-center">
                  <Image
                    src={settings?.logo || '/spr_logo.png'}
                    alt="SPR Group of Export"
                    width={270}
                    height={175}
                    priority
                    onError={(e) => {
                      e.target.src = '/spr_logo.png'
                    }}
                  />
                </Link>

                {/* Search Bar */}
                <SearchBar
                  showCategories={showCategories}
                  setShowCategories={setShowCategories}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                />

                {/* Header Icons */}
                <HeaderIcons />
              </div>
            </div>
          </div>

          {/* Navigation */}
          <Navigation
            navItems={navItems}
            showCatalogDropdown={showCatalogDropdown}
            setShowCatalogDropdown={setShowCatalogDropdown}
            activeSubmenu={activeSubmenu}
            setActiveSubmenu={setActiveSubmenu}
          />

          {/* Breadcrumbs */}
          <BreadcrumbsWrapper />
        </div>
      </header>
    </>
  )
}

export default Header
