'use client'

import { useWishlist } from '@/context/WishlistContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { FiHeart, FiShoppingBag, FiArrowLeft } from 'react-icons/fi'
import { useCart } from '@/context/CartContext'
import { toast } from '@/utils/toastConfig'

export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist()
  const { addToCart } = useCart()
  const router = useRouter()

  const handleAddToCart = (product) => {
    addToCart(product, 1)
    toast.success('Added to cart!')
  }

  const handleRemoveFromWishlist = (productId) => {
    removeFromWishlist(productId)
    toast.success('Removed from wishlist')
  }

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Your Wishlist is Empty
            </h1>
            <p className="text-gray-600 mb-8">
              You haven&apos;t added any items to your wishlist yet.
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#BA8B4E] hover:bg-[#a87d45] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#BA8B4E]"
            >
              Continue Shopping
            </Link>
          </div>
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
            className="flex items-center text-gray-600 hover:text-[#BA8B4E] transition-colors mr-4"
          >
            <FiArrowLeft className="mr-2" /> Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
          <span className="ml-4 bg-gray-200 text-gray-700 text-sm font-medium px-3 py-1 rounded-full">
            {wishlist.length} {wishlist.length === 1 ? 'Item' : 'Items'}
          </span>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <ul className="divide-y divide-gray-200">
            {wishlist.map((product) => (
              <li key={product.id} className="p-6">
                <div className="flex flex-col md:flex-row md:items-center">
                  <div className="flex-shrink-0 w-full md:w-32 h-32 relative">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover rounded"
                    />
                  </div>

                  <div className="mt-4 md:mt-0 md:ml-6 flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-500">{product.brand}</p>
                      </div>
                      <div className="text-lg font-medium text-gray-900">
                        ₹{product.price.toLocaleString('en-IN')}
                      </div>
                    </div>

                    <div className="mt-4 flex space-x-4">
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#BA8B4E] hover:bg-[#a87d45] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#BA8B4E]"
                      >
                        <FiShoppingBag className="mr-2" />
                        Add to Cart
                      </button>

                      <button
                        onClick={() => handleRemoveFromWishlist(product.id)}
                        className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#BA8B4E]"
                      >
                        <FiHeart className="mr-2 text-red-500 fill-current" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
