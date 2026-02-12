'use client'

import { useWishlist } from '@/context/WishlistContext'
import { useCart } from '@/context/CartContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { FiHeart, FiShoppingBag, FiArrowLeft, FiLoader } from 'react-icons/fi'
import { toast } from '@/utils/toastConfig'
import { useAuth } from '@/context/AuthContext'
import { useEffect, useState } from 'react'

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, wishlistLoading, getWishlist } =
    useWishlist()
  const { addToCart } = useCart()
  const { loading: authLoading } = useAuth()
  const router = useRouter()

  const getImageSrc = (image) => {
    if (!image) return '/placeholder-product.jpg'
    if (typeof image === 'string') return image
    return (
      image.thumbnailUrl ||
      image.mediumUrl ||
      image.largeUrl ||
      '/placeholder-product.jpg'
    )
  }

  const [showLoader, setShowLoader] = useState(true)

  useEffect(() => {
    if (!authLoading) {
      getWishlist()
    }
  }, [authLoading, getWishlist])

  useEffect(() => {
    if (!authLoading && !wishlistLoading) {
      const timer = setTimeout(() => setShowLoader(false), 1000)
      return () => clearTimeout(timer)
    }
  }, [authLoading, wishlistLoading])

  const handleAddToCart = (product) => {
    addToCart(product, 1)
    toast.success('Added to cart!')
  }

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await removeFromWishlist(productId)
      toast.success('Removed from wishlist')
    } catch (error) {
      console.error('Failed to remove from wishlist:', error)
      toast.error('Failed to remove from wishlist')
    }
  }

  if (authLoading || showLoader) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-3">
          <FiLoader className="h-8 w-8 animate-spin text-[#BA8B4E]" />
          <p className="text-sm text-gray-600">Loading wishlist...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-[#BA8B4E] mr-4"
          >
            <FiArrowLeft className="mr-2" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
        </div>

        {wishlist.length === 0 ? (
          <div className="text-center py-12">
            <FiHeart className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No items in wishlist
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Add some items to your wishlist to see them here.
            </p>
            <div className="mt-6">
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#BA8B4E] hover:bg-[#9a7240] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#BA8B4E]"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
            {wishlist.map((product) => (
              <div
                key={product.id}
                className="group relative bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
              >
                <div className="relative w-full aspect-square overflow-hidden rounded-lg bg-gray-50">
                  <Image
                    src={getImageSrc(product.image)}
                    alt={product.name || 'Product'}
                    width={300}
                    height={300}
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                  <button
                    onClick={() => handleRemoveFromWishlist(product.id)}
                    className="absolute top-3 right-3 p-2 bg-white rounded-full border border-[#BA8B4E] hover:bg-gray-50 transition-colors duration-200"
                    title="Remove from wishlist"
                  >
                    <FiHeart className="h-5 w-5 text-[#BA8B4E] fill-[#BA8B4E] hover:fill-[#9a7240] transition-colors" />
                  </button>
                </div>
                <div className="mt-4 px-1">
                  <h3 className="text-sm font-medium text-gray-800 line-clamp-2 h-10 flex items-center">
                    {product.name}
                  </h3>
                  <p className="mt-2 text-base font-semibold text-[#BA8B4E]">
                    ${product.price}
                  </p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="w-full flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-md text-white bg-[#BA8B4E] hover:bg-[#9a7240] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#BA8B4E] transition-colors duration-200"
                  >
                    <FiShoppingBag className="mr-2 h-4 w-4" />
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
