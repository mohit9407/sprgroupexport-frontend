'use client'

import { useParams, useRouter } from 'next/navigation'
import React, { useState, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FaHeart, FaCheck, FaShoppingBag } from 'react-icons/fa'
import OffersModal from '@/components/OffersModal'
import { toast } from '@/utils/toastConfig'
import ProductImages from '@/components/ProductImages'
import {
  fetchProductDetails,
  clearProductDetails,
} from '@/features/products/productDetailsSlice'
import {
  fetchAllAttributes,
  selectAllAttributes,
  selectAttributeStatus,
} from '@/features/attributes/attributesSlice'
import {
  fetchProductOffers,
  selectProductOffers,
} from '@/features/coupons/couponsSlice'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { useAuth } from '@/context/AuthContext'
import AuthModal from '@/components/Auth/AuthModal'
import RelatedProducts from '@/components/RelatedProducts'

export default function ProductDetails() {
  const dispatch = useDispatch()
  const router = useRouter()
  const params = useParams()
  const productId = params?.id
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const { user } = useAuth()

  const [quantity, setQuantity] = useState(1)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [pendingAction, setPendingAction] = useState(null) // 'addToCart' or 'buyNow'
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [selectedSize, setSelectedSize] = useState(null)
  const [selectedColor, setSelectedColor] = useState(null)
  const [activeTab, setActiveTab] = useState('details')
  const [showOffersModal, setShowOffersModal] = useState(false)

  // Get product details from Redux store
  const {
    data: product,
    status,
    error,
  } = useSelector((state) => state.productDetails)

  // Get offers after product is defined
  const offers =
    useSelector((state) => selectProductOffers(product?._id)(state)) || []

  const scrollToSpecial = () => {
    const element = document.getElementById('why-special')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Get attributes from Redux store
  const attributes = useSelector(selectAllAttributes)
  const attributesStatus = useSelector(selectAttributeStatus)

  // Show loading state when either product or attributes are loading
  const isLoading = status === 'loading' || attributesStatus === 'loading'

  // derive wishlist status from context
  const isWishlisted = React.useMemo(
    () => (product ? isInWishlist(product.id) : false),
    [product, isInWishlist],
  )

  // Fetch product details and attributes when component mounts or productId changes
  useEffect(() => {
    if (productId) {
      dispatch(fetchProductDetails(productId))
      dispatch(fetchAllAttributes())
    }

    return () => {
      dispatch(clearProductDetails())
    }
  }, [dispatch, productId])

  // Fetch offers when product data is loaded
  useEffect(() => {
    if (product?._id && product?.coupons?.length) {
      dispatch(fetchProductOffers(product))
    }
  }, [product, dispatch])

  // Set default selected color and size when product or attributes are loaded
  useEffect(() => {
    const timers = []

    if (product?.colors?.length > 0 && attributes.colors?.length > 0) {
      const defaultColor = attributes.colors.find((c) =>
        product.colors.includes(c._id),
      )
      if (defaultColor) {
        timers.push(setTimeout(() => setSelectedColor(defaultColor._id), 0))
      }
    }

    if (product?.sizes?.length > 0 && attributes.sizes?.length > 0) {
      const defaultSize = attributes.sizes.find((s) =>
        product.sizes.includes(s._id),
      )
      if (defaultSize) {
        timers.push(setTimeout(() => setSelectedSize(defaultSize._id), 0))
      }
    }

    return () => timers.forEach(clearTimeout)
  }, [product, attributes])

  const handleAddToCart = async (skipAuthCheck = false) => {
    // Check authentication first if not skipping
    if (!user) {
      setPendingAction('addToCart')
      setShowAuthModal(true)
      return
    }

    if (!product || !product._id) {
      toast.error('Product information is not available');
      return false;
    }

    // Check max order limit
    if (product.maxOrderLimit && quantity > product.maxOrderLimit) {
      toast.error(`Maximum order limit is ${product.maxOrderLimit} items`);
      return false;
    }

    try {
      setIsAddingToCart(true);

      // Find the selected color and size details with null checks
      const color = attributes?.colors?.find((c) => c._id === selectedColor);
      const size = attributes?.sizes?.find((s) => s._id === selectedSize);

      await addToCart(
        {
          id: product._id,
          name: product.name,
          price: product.price,
          image: product.image,
          color: color?.value || '',
          colorId: selectedColor,
          size: size?.value || '',
          sizeId: selectedSize,
        },
        quantity,
      )

      toast.success('Added to cart!');
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(error.response?.data?.message || 'Failed to add item to cart');
      return false;
    } finally {
      setIsAddingToCart(false);
    }
  }

  const handleBuyNow = async () => {
    if (!user) {
      setPendingAction('buyNow')
      setShowAuthModal(true)
      return
    }

    if (!product || !product._id) {
      toast.error('Product information is not available')
      return
    }

    // Create a temporary cart item
    const color = attributes?.colors?.find((c) => c._id === selectedColor)
    const size = attributes?.sizes?.find((s) => s._id === selectedSize)

    const cartItem = {
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      color: color?.value || '',
      colorId: selectedColor,
      size: size?.value || '',
      sizeId: selectedSize,
      quantity: quantity,
      inStock: true,
      // Add a flag to indicate this is a direct checkout item
      isDirectCheckout: true
    }

    // Clear any existing direct checkout items first
    sessionStorage.removeItem('directCheckoutItem')

    // Store the item in session storage for checkout
    sessionStorage.setItem('directCheckoutItem', JSON.stringify(cartItem))

    // Clear the cart from localStorage to prevent any conflicts
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cart')
    }

    // Redirect to checkout page
    router.push('/checkout')
  }

  const handleWishlistToggle = () => {
    if (!product) return

    if (!user) {
      setShowAuthModal(true)
      return
    }

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
  if (isLoading || !product) {
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        {/* Auth Modal */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => {
            setShowAuthModal(false)
            setPendingAction(null)
          }}
          onLoginSuccess={async () => {
            if (pendingAction === 'addToCart') {
              await handleAddToCart(true)
            } else if (pendingAction === 'buyNow') {
              // For Buy Now, we don't need to add to cart
              // Just redirect to checkout which will handle the direct checkout item
              router.push('/checkout')
            }
            setPendingAction(null)
          }}
        />
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Product Images - Sticky */}
          <div className="lg:w-1/2 lg:sticky lg:top-8 lg:self-start">
            <div className="lg:pr-4">
              <ProductImages
                images={product.image.mediumUrl}
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
            {offers.length > 0 && (
              <div className="border-t border-b border-gray-200 py-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {offers.length} OFFER{offers.length !== 1 ? 'S' : ''}
                    </span>
                    {offers.length > 2 && (
                      <button
                        onClick={() => setShowOffersModal(true)}
                        className="text-xs text-[#b7853f] hover:underline"
                      >
                        VIEW ALL
                      </button>
                    )}
                  </div>
                </div>
                <ul className="space-y-2 text-sm">
                  {offers.slice(0, 2).map((offer, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <FaCheck className="text-green-500 mt-0.5 flex-shrink-0" />
                      <span>
                        {offer.description || `Special Offer ${index + 1}`}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Color and Size Selection - Side by Side */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Color Selection */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Color
                </h3>
                <div className="flex flex-wrap gap-2">
                  <p className="text-sm text-gray-600">{product?.color}</p>
                </div>
              </div>

              {/* Size Selection */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Size</h3>
                <div className="flex flex-wrap gap-2">
                  <p className="text-sm text-gray-600">{product?.size}</p>
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
                  {product.maxOrderLimit && (
                    <span className="text-xs block text-gray-500">
                      Max: {product.maxOrderLimit}
                    </span>
                  )}
                </span>
                <button
                  onClick={() => {
                    if (product.maxOrderLimit && quantity >= product.maxOrderLimit) {
                      toast.error(`Maximum order limit is ${product.maxOrderLimit} items`);
                      return;
                    }
                    setQuantity(quantity + 1);
                  }}
                  className={`px-4 py-2 text-sm font-medium ${product.maxOrderLimit && quantity >= product.maxOrderLimit ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100 cursor-pointer'}`}
                  disabled={product.maxOrderLimit && quantity >= product.maxOrderLimit}
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
              <div className="flex space-x-1">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`px-6 py-2 rounded-t font-medium cursor-pointer ${activeTab === 'details'
                      ? 'bg-[#b7853f] text-white'
                      : 'bg-gray-100 text-gray-600'
                    }`}
                >
                  Details
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`px-6 py-2 rounded-t font-medium cursor-pointer ${activeTab === 'reviews'
                      ? 'bg-[#b7853f] text-white'
                      : 'bg-gray-100 text-gray-600'
                    }`}
                >
                  Reviews ({product?.reviews?.length || 0})
                </button>
              </div>
              <div className="text-gray-700 text-sm p-4">
                {activeTab === 'details' ? (
                  <div className="space-y-4">
                    {product?.productDetails && (
                      <div className="mt-6">
                        <h4 className="text-lg font-medium text-gray-900 mb-3">
                          Product Details
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {product.productDetails.totalMetalWeight && (
                            <div>
                              <span className="text-gray-600">
                                Total Weight:{' '}
                              </span>
                              <span className="font-medium">
                                {product.productDetails.totalMetalWeight}
                              </span>
                            </div>
                          )}
                          {product.productDetails.materialType && (
                            <div>
                              <span className="text-gray-600">Material: </span>
                              <span className="font-medium">
                                {product.productDetails.materialType}
                              </span>
                            </div>
                          )}
                          {product.productDetails.metalType && (
                            <div>
                              <span className="text-gray-600">
                                Metal Type:{' '}
                              </span>
                              <span className="font-medium">
                                {product.productDetails.metalType}
                              </span>
                            </div>
                          )}
                          {product.productDetails.occasionType?.length > 0 && (
                            <div className="md:col-span-2">
                              <span className="text-gray-600">Occasions: </span>
                              <span className="font-medium">
                                {product.productDetails.occasionType.join(', ')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
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
        {showOffersModal && (
          <OffersModal
            offers={offers}
            onClose={() => setShowOffersModal(false)}
          />
        )}

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
        {product && (
          <RelatedProducts
            category={product.category?._id || product.category}
            excludeProductId={product._id || product.id}
          />
        )}
      </main>
    </div>
  )
}
