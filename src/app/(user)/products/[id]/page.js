'use client'

'use client'

import { useParams, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { FaHeart, FaStar } from 'react-icons/fa'
import { products } from '@/data/products'
import RelatedProducts from '@/components/RelatedProducts'
import ProductImages from '@/components/ProductImages'

// Function to get product by ID
const getProductById = (id) => {
  if (!id) return null
  return products.find((product) => product.id.toString() === id.toString())
}

export default function ProductDetails() {
  const [isClient, setIsClient] = useState(false)
  const params = useParams()
  const searchParams = useSearchParams()
  const productId = params?.id || searchParams?.get('id')

  const [quantity, setQuantity] = useState(1)
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('descriptions')

  // Set client-side flag
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Load product data
  useEffect(() => {
    if (!productId) {
      setLoading(false)
      return
    }

    const loadProduct = () => {
      try {
        const foundProduct = getProductById(productId)
        if (foundProduct) {
          setProduct(foundProduct)
        }
      } catch (error) {
        console.error('Error loading product:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [productId])

  if (loading || !isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-black mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Loading product details...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Product Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            We couldn&apos;t find the product you&apos;re looking for.
          </p>
          <div className="bg-gray-100 p-4 rounded-lg mb-6 text-left">
            <p className="text-sm text-gray-600">
              Requested ID: <span className="font-mono">{params?.id}</span>
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Available IDs:{' '}
              <span className="font-mono">
                {products.map((p) => p.id).join(', ')}
              </span>
            </p>
          </div>
          <Link
            href="/"
            className="inline-block w-full bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium cursor-pointer"
          >
            ← Return to Home
          </Link>
        </div>
      </div>
    )
  }

  const handleQuantityChange = (increment) => {
    setQuantity((prev) => (increment ? prev + 1 : Math.max(1, prev - 1)))
  }

  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Centered Product Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {product.name.toUpperCase()}
          </h1>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Product Images */}
          <div className="md:w-1/2">
            <ProductImages
              images={product.images || [product.image]}
              productName={product.name}
            />
          </div>

          {/* Product Info */}
          <div className="md:w-1/2 p-8 rounded-lg shadow">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {product.name.toUpperCase()}
            </h1>
            <p className="text-gray-600 mb-4">{product.name}</p>

            <div className="mb-4">
              <span className="text-3xl font-bold text-[#b7853f]">
                ₹{product.price.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center mb-6">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`h-5 w-5 ${i < product.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                ))}
              </div>
              <span className="ml-2 text-sm text-gray-600">0 Reviews</span>
            </div>

            <div className="space-y-2 text-sm text-gray-600 mb-6">
              <div>
                <span className="font-medium">Product ID :</span> {product.id}
              </div>
              <div>
                <span className="font-medium">Category:</span>{' '}
                {product.category}
              </div>
              <div>
                <span className="font-medium">Available:</span>{' '}
                <span className="text-green-500">InStock</span>
              </div>
              <div>
                <span className="font-medium">Min Order Limit:</span> 1
              </div>
            </div>

            <div className="flex items-center mb-6">
              <span className="mr-4 font-medium text-gray-700">Quantity:</span>
              <div className="flex items-center border border-gray-300 rounded">
                <button
                  onClick={() => handleQuantityChange(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  -
                </button>
                <span className="px-6 py-1 bg-gray-100 border-x border-gray-300">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(true)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex space-x-4 mb-8">
              <button className="bg-[#b7853f] hover:bg-[#9a7237] text-white px-10 py-3 rounded font-medium transition-colors cursor-pointer">
                ADD TO CART
              </button>
              <button className="flex items-center text-gray-700 hover:text-gray-900 cursor-pointer">
                <FaHeart className="mr-2 text-gray-600" /> ADD TO WISHLIST
              </button>
            </div>

            <div className="border-t border-b border-gray-200 py-4">
              <div className="flex space-x-1 mb-4">
                <button
                  onClick={() => setActiveTab('descriptions')}
                  className={`px-6 py-2 rounded-t font-medium cursor-pointer ${
                    activeTab === 'descriptions'
                      ? 'bg-[#b7853f] text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Descriptions
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`px-6 py-2 rounded-t font-medium cursor-pointer ${
                    activeTab === 'reviews'
                      ? 'bg-[#b7853f] text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Reviews (0)
                </button>
              </div>
              <div className="text-gray-700 text-sm p-4">
                {activeTab === 'descriptions' ? (
                  <p>
                    18 k White Gold e/f vvs Netural Diamonds Center Diamonds
                    customised
                  </p>
                ) : (
                  <p>No reviews yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        <RelatedProducts />
      </main>
    </div>
  )
}
