'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FaHeart, FaCheck, FaShoppingBag } from 'react-icons/fa'
import OffersModal from '@/components/OffersModal'
import { toast } from '@/utils/toastConfig'
import ProductImages from '@/components/ProductImages'
import {
  fetchProductDetails,
  clearProductDetails,
} from '@/features/products/productDetailsSlice'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import RelatedProducts from '@/components/RelatedProducts'

export default function ProductDetails() {
  const dispatch = useDispatch()
  const router = useRouter()
  const params = useParams()
  const productId = params?.id
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()

  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [selectedSize, setSelectedSize] = useState('Free Size')
  const [activeTab, setActiveTab] = useState('descriptions')
  const [showOffersModal, setShowOffersModal] = useState(false)

  const scrollToSpecial = () => {
    const element = document.getElementById('why-special')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Get product details from Redux store
  const {
    data: product,
    status,
    error,
  } = useSelector((state) => state.productDetails)

  // derive wishlist status from context
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
    }
  }, [dispatch, productId])

  const handleAddToCart = () => {
    if (!product) return

    setIsAddingToCart(true)
    addToCart(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        size: selectedSize,
      },
      quantity,
    )

    toast.success('Added to cart!')
    setTimeout(() => setIsAddingToCart(false), 1000)
  }

  const handleBuyNow = () => {
    handleAddToCart()
    // Small delay to ensure cart is updated
    setTimeout(() => {
      router.push('/cart')
    }, 500)
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
      })
      toast.success('Added to wishlist!')
    }
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
      <div className="min-h-screen flex items-center justify-center bg-white p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            {error || 'Product not found'}
          </h1>
          <button
            onClick={() => router.push('/')}
            className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Product Images - Sticky */}
          <div className="lg:w-1/2 lg:sticky lg:top-8 lg:self-start">
            <div className="lg:pr-4">
              <ProductImages
                images={product.image}
                sideImages={product.sideImages || []}
                productName={product.productName}
              />
            </div>
          </div>

          {/* Product Info - Scrollable */}
          <div className="lg:w-1/2 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto lg:pr-4">
            <h1 className="text-2xl font-medium text-[#b7853f] mb-1">
              {product.productName}
            </h1>
            <h2 className="text-gray-600 text-sm mb-4">
              {product.productModel}
            </h2>
            <div className="mb-6">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-[#b7853f]">
                  ₹{product.price?.toLocaleString('en-IN')}
                </span>
                <span className="text-sm text-gray-500">
                  MRP (Incl. of all taxes)
                </span>
              </div>
            </div>

            {/* Offers Section */}
            <div className="border-t border-b border-gray-200 py-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {product.offers?.length || 0} OFFERS
                  </span>
                  <button
                    onClick={() => setShowOffersModal(true)}
                    className="text-xs text-[#b7853f] hover:underline"
                  >
                    VIEW ALL
                  </button>
                </div>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <FaCheck className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span>
                    10% Instant Discount up to ₹1,750 on ICICI Bank Credit Card
                    EMI
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <FaCheck className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span>5% Cashback on Flipkart Axis Bank Card</span>
                </li>
              </ul>
            </div>

            {/* Color and Size Selection - Side by Side */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Color Selection */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Color
                </h3>
                <p className="text-sm text-gray-600">Gold Tone</p>
              </div>

              {/* Size Selection */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {['Free Size'].map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 border rounded-md text-sm w-full ${
                        selectedSize === size
                          ? 'border-black text-black'
                          : 'border-gray-300 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center mb-6">
              <span className="mr-4 font-medium text-gray-700">Quantity:</span>
              <div className="flex items-center border border-gray-300 rounded">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  -
                </button>
                <span className="px-6 py-1 bg-gray-100 border-x border-gray-300">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className={`flex-1 bg-white border-2 border-[#b7853f] text-[#b7853f] px-6 py-3 rounded-md font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors`}
              >
                <FaShoppingBag />
                {isAddingToCart ? 'Adding...' : 'ADD TO CART'}
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 bg-[#b7853f] text-gray-50 px-6 py-3 rounded-md font-medium hover:bg-[#b7853f] transition-colors"
              >
                BUY NOW
              </button>
            </div>

            {/* Why It's Special */}
            <div className="border-t border-gray-200 pt-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                WHY IT&apos;S SPECIAL
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                Elevate your look with this stunning Gold Tone Clemina Hinge
                Metallic Cuff from Ted Baker. The intricate design and premium
                finish make it a perfect accessory for any occasion.
              </p>
              <button
                onClick={scrollToSpecial}
                className="text-sm text-[#b7853f] hover:underline cursor-pointer"
              >
                Read More
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

        {/* Offers Modal */}
        <OffersModal
          isOpen={showOffersModal}
          onClose={() => setShowOffersModal(false)}
          offers={[
            {
              description:
                '10% Instant Discount up to ₹1,750 on ICICI Bank Credit Card EMI',
              code: 'ICICICREDIT',
              validity: '31 Dec 2025',
            },
            {
              description: '5% Cashback on Flipkart Axis Bank Card',
              code: 'FLIPKART5',
              validity: '15 Jan 2026',
            },
            {
              description: 'Extra 10% off on SBI Credit Card',
              code: 'SBICREDIT',
              validity: '28 Feb 2026',
            },
            {
              description: 'No Cost EMI on Bajaj Finserv',
              code: 'BAJAJEMI',
              validity: '31 Mar 2026',
            },
            {
              description: 'Special price for Prime Members',
              validity: 'Ongoing',
            },
            {
              description: '5% Off on UPI payment',
              code: 'UPI5',
              validity: '20 Jan 2026',
            },
            {
              description: 'Free shipping on orders above ₹999',
              validity: 'Ongoing',
            },
            {
              description: 'Buy 1 Get 1 Free on selected items',
              code: 'B1G1',
              validity: '14 Feb 2026',
            },
            {
              description: 'Extra 5% off on prepaid orders',
              code: 'PREPAID5',
              validity: '28 Feb 2026',
            },
          ]}
        />

        {/* Why It's Special Section */}
        <div id="why-special" className="mt-16 mb-12 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-medium text-gray-900 mb-6">
              WHY IT&apos;S SPECIAL
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Elevate your look with this stunning Gold Tone Clemina Hinge
              Metallic Cuff from Ted Baker. The intricate design and premium
              finish make it a perfect accessory for any occasion.
            </p>
          </div>
        </div>

        {/* Related Products Section */}
        <RelatedProducts />
      </main>
    </div>
  )
}
