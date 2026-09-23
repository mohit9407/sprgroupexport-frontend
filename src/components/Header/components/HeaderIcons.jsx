'use client'

import { FaRegHeart, FaShoppingBag } from 'react-icons/fa'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'

const HeaderIcons = () => {
  const { cartCount } = useCart()
  const { wishlistCount } = useWishlist()

  return (
    <div className="flex items-center space-x-8">
      <Link
        href="/wishlist"
        className="relative transition-colors flex flex-col items-center"
      >
        <div className="relative">
          <FaRegHeart className="text-4xl" />
          <span className="absolute -top-2 -right-2 bg-[#004372] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {wishlistCount}
          </span>
        </div>
        <span className="text-xs font-medium text-gray-600 mt-1 tracking-wide">
          WISHLIST
        </span>
      </Link>
      <Link
        href="/cart"
        className="relative transition-colors flex flex-col items-center"
      >
        <div className="relative">
          <FaShoppingBag className="text-4xl" />
          <span className="absolute -top-2 -right-2 bg-[#004372] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {cartCount}
          </span>
        </div>
        <span className="text-xs font-medium text-gray-600 mt-1 tracking-wide">
          CART
        </span>
      </Link>
    </div>
  )
}

export default HeaderIcons
