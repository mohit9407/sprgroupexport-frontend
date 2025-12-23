'use client'

import React from 'react'
import { FaTwitterSquare, FaEnvelope } from 'react-icons/fa'
import { GrInstagram } from 'react-icons/gr'
import { BsGoogle } from 'react-icons/bs'
import { ImFacebook2 } from 'react-icons/im'
import Link from 'next/link'
import Image from 'next/image'

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <footer className="w-full bg-white border-t border-gray-200 relative z-1">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="w-64 h-40 relative">
              <Image
                src="/spr_logo.png"
                alt="SPR Logo"
                fill
                className="object-contain object-left"
                sizes="(max-width: 768px) 100vw, 256px"
                priority
              />
            </div>

            <div className="flex items-center text-gray-600 text-xs">
              <FaEnvelope className="w-5 h-5 mr-1 text-gray-500 flex-shrink-0" />
              <a
                href="mailto:sprgroup100@gmail.com"
                className="hover:underline hover:text-[#BA8B4E] text-[15px] text-gray-700 ml-1"
              >
                sprgroup100@gmail.com
              </a>
            </div>
            <div className="flex space-x-3 pt-2">
              <a
                href="#"
                className="text-gray-500 hover:text-[#3b5998]"
                aria-label="Facebook"
              >
                <ImFacebook2 className="w-6 h-6" />
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-[#1DA1F2]"
                aria-label="Twitter"
              >
                <FaTwitterSquare className="w-6 h-6" />
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-[#DB4437]"
                aria-label="Google"
              >
                <BsGoogle className="w-6 h-6" />
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-[#E1306C]"
                aria-label="Instagram"
              >
                <GrInstagram className="w-6 h-6" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4 text-gray-800 uppercase tracking-wider">
              QUICK LINKS
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-gray-600 hover:text-[#BA8B4E] text-sm transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/shop"
                  className="text-gray-600 hover:text-[#BA8B4E] text-sm transition-colors"
                >
                  Shop
                </Link>
              </li>
              <li>
                <Link
                  href="/orders"
                  className="text-gray-600 hover:text-[#BA8B4E] text-sm transition-colors"
                >
                  Orders
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  className="text-gray-600 hover:text-[#BA8B4E] text-sm transition-colors"
                >
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link
                  href="/wishlist"
                  className="text-gray-600 hover:text-[#BA8B4E] text-sm transition-colors"
                >
                  Wishlist
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4 text-gray-800 uppercase tracking-wider">
              PERSONALIZATION
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/privacy-policy"
                  className="text-gray-600 hover:text-[#BA8B4E] text-sm transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/refund-policy"
                  className="text-gray-600 hover:text-[#BA8B4E] text-sm transition-colors"
                >
                  Return and Refund Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping"
                  className="text-gray-600 hover:text-[#BA8B4E] text-sm transition-colors"
                >
                  Shipping and Delivery
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-gray-600 hover:text-[#BA8B4E] text-sm transition-colors"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-600 hover:text-[#BA8B4E] text-sm transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4 text-gray-800 uppercase tracking-wider">
              INSTAGRAM FEED
            </h3>
            {/* <div className="grid grid-cols-3 gap-2">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="aspect-square bg-gray-100 rounded-sm hover:opacity-80 transition-opacity"></div>
                            ))}
                        </div> */}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border-t border-gray-200 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <div className="text-gray-500 text-xs">
            &copy; {new Date().getFullYear()} SPR Group of Export. All rights
            reserved.
          </div>
          <div className="flex space-x-4">
            <Link
              href="/privacy"
              className="text-gray-500 hover:text-[#BA8B4E] text-xs transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              href="/terms"
              className="text-gray-500 hover:text-[#BA8B4E] text-xs transition-colors"
            >
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
