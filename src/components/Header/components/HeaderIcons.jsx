'use client'

import { FaRegHeart, FaShoppingBag } from 'react-icons/fa'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'

const HeaderIcons = () => {
  const { cartCount } = useCart()
  const { wishlistCount } = useWishlist()

  return (
    <div className="flex items-center space-x-6">
      <Link
        href="/wishlist"
        className="relative transition-colors flex flex-col items-center"
      >
        <div className="relative">
          <FaRegHeart className="text-3xl" />
          <span className="absolute -top-1.5 -right-1.5 bg-[#BA8B4E] text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
            {wishlistCount}
          </span>
        </div>
        <span className="text-[10px] font-medium text-gray-600 mt-0.5 tracking-wide">
          WISHLIST
        </span>
      </Link>
      <Link
        href="/cart"
        className="relative transition-colors flex flex-col items-center"
      >
        <div className="relative">
          <FaShoppingBag className="text-3xl" />
          <span className="absolute -top-1.5 -right-1.5 bg-[#BA8B4E] text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
            {cartCount}
          </span>
        </div>
        <span className="text-[10px] font-medium text-gray-600 mt-0.5 tracking-wide">
          CART
        </span>
      </Link>
    </div>
  )
}

export default HeaderIcons
