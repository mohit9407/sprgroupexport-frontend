'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Link from 'next/link'
import { FaHeart, FaStar, FaCheck, FaShoppingCart } from 'react-icons/fa'
import { toast } from '@/utils/toastConfig'
import RelatedProducts from '@/components/RelatedProducts'
import ProductImages from '@/components/ProductImages'
import {
  fetchProductDetails,
  clearProductDetails,
} from '@/features/products/productDetailsSlice'
import {
  fetchCategoryById,
  clearCategoryDetails,
} from '@/features/categories/categoryDetailsSlice'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'

export default function ProductDetails() {
  const dispatch = useDispatch()
  const router = useRouter()
  const params = useParams()
  const productId = params?.id
  const { addToCart, isInCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()

  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('descriptions')
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  // Get product details and category from Redux store
  const {
    data: product,
    status,
    error,
  } = useSelector((state) => state.productDetails)

  const categoryState = useSelector((state) => state.categoryDetails || {})
  const categoryDetails = categoryState.data

  // derive wishlist status from context to avoid setting state in effects
  const isWishlisted = React.useMemo(
    () => (product ? isInWishlist(product.id) : false),
    [product, isInWishlist],
  )

  // Fetch product details when component mounts or productId changes
  useEffect(() => {
    if (productId) {
      dispatch(fetchProductDetails(productId)).catch(console.error)
    }
    return () => {
      dispatch(clearProductDetails())
      dispatch(clearCategoryDetails())
    }
  }, [dispatch, productId])

  // Fetch category details when product data is available
  useEffect(() => {
    if (product?.category) {
      dispatch(fetchCategoryById(product.category))
    }
  }, [dispatch, product?.category])

  // Wishlist status is derived from context via useMemo. No local effect required.

  const handleAddToCart = () => {
    if (!product) return

    setIsAddingToCart(true)
    addToCart(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        slug: product.slug || `product-${product.id}`,
      },
      quantity,
    )

    toast.success('Added to cart!')

    // Reset button state after animation
    setTimeout(() => {
      setIsAddingToCart(false)
    }, 1000)
  }

  const handleWishlistToggle = () => {
    if (!product) return

    if (isWishlisted) {
      removeFromWishlist(product.id)
      toast.info('Removed from wishlist')
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        slug: product.slug || `product-${product.id}`,
      })
      toast.success('Added to wishlist!')
    }

    // wishlist state comes from context and will update automatically; no local setState needed.
  }

  const handleBuyNow = () => {
    handleAddToCart()
    // Small delay to ensure cart is updated
    setTimeout(() => {
      router.push('/cart')
    }, 500)
  }

  // Handle loading and error states
  if (status === 'loading' || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-black mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Loading product details...</p>
        </div>
      </div>
    )
  }

  if (status === 'failed') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            {error || 'Error Loading Product'}
          </h1>
          <Link
            href="/"
            className="inline-block w-full bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium cursor-pointer mt-6"
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
            {product?.name?.toUpperCase()}
          </h1>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Product Images */}
          <div className="md:w-1/2">
            <ProductImages
              images={[product.image]} // Main product image
              sideImages={product.sideImages || []} // Side images array
              productName={product.name || 'Product Image'}
            />
          </div>

          {/* Product Info */}
          <div className="md:w-1/2 p-8 rounded-lg shadow">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {product?.name?.toUpperCase?.() || 'Product Name'}
            </h1>
            <p className="text-gray-600 mb-4">
              {product?.name || 'Product Name'}
            </p>

            <div className="mb-4">
              <span className="text-3xl font-bold text-[#b7853f]">
                {product?.price
                  ? `₹${product.price.toLocaleString()}`
                  : 'Price not available'}
              </span>
            </div>

            <div className="flex items-center mb-6">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`h-5 w-5 ${product?.reviews?.length > 0 ? (i < Math.round(product.reviews.reduce((acc, curr) => acc + curr.rating, 0) / product.reviews.length) ? 'text-yellow-400' : 'text-gray-300') : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                ))}
              </div>
              <span className="ml-2 text-sm text-gray-600">
                {product?.reviews?.length || 0}{' '}
                {product?.reviews?.length === 1 ? 'Review' : 'Reviews'}
              </span>
            </div>

            <div className="space-y-2 text-sm text-gray-600 mb-6">
              <div>
                <span className="font-medium">Product ID :</span>{' '}
                {product?.id || 'N/A'}
              </div>
              <div>
                <span className="font-medium">Category:</span>{' '}
                {categoryDetails?.name || product?.category || 'Loading...'}
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

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mb-8">
              <div className="flex-1">
                <button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                  className={`w-full flex items-center justify-center gap-2 bg-[#b7853f] hover:bg-[#9a7237] text-white px-6 py-3 rounded font-medium transition-all ${isAddingToCart ? 'opacity-75' : ''}`}
                >
                  {isAddingToCart ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      ADDING...
                    </>
                  ) : (
                    <>
                      <FaShoppingCart className="text-white" />
                      ADD TO CART
                    </>
                  )}
                </button>
              </div>
              {/* <button
                onClick={handleWishlistToggle}
                className={`flex items-center justify-center px-6 py-3 rounded font-medium transition-colors ${isWishlisted
                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                <FaHeart className={`mr-2 ${isWishlisted ? 'text-red-500' : 'text-gray-600'}`} />
                {isWishlisted ? 'WISHLISTED' : 'WISHLIST'}
              </button> */}
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
                  Reviews ({product?.reviews?.length || 0})
                </button>
              </div>
              <div className="text-gray-700 text-sm p-4">
                {activeTab === 'descriptions' ? (
                  <p>{product?.description}</p>
                ) : (
                  <div className="space-y-6">
                    {product?.reviews?.length > 0 ? (
                      product.reviews.map((review, index) => (
                        <div
                          key={index}
                          className="border-b border-gray-200 pb-4"
                        >
                          <p className="text-gray-800">{review.comment}</p>
                        </div>
                      ))
                    ) : (
                      <p>No reviews yet.</p>
                    )}
                  </div>
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
