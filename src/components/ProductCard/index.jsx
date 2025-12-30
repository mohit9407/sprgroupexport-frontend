import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { FiHeart, FiEye, FiShoppingBag, FiCheck } from 'react-icons/fi'
import { useDispatch, useSelector } from 'react-redux'
import { selectAllCategories } from '@/features/categories/categoriesSlice'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { useAuth } from '@/context/AuthContext'
import AuthModal from '../Auth/AuthModal'
import { toast } from '@/utils/toastConfig'
import { fetchProductDetails } from '@/features/products/productDetailsSlice'

// ProductInfo declared at module scope to avoid creating components during render
const ProductInfo = ({
  className = '',
  brand,
  name,
  price,
  viewMode,
  handleNavigate,
  categoryName,
}) => (
  <div className={className}>
    <p className="text-sm text-[#8A9BA8] uppercase tracking-wider mb-1">
      {categoryName || brand}
    </p>
    <h3
      onClick={handleNavigate}
      className="text-base text-[#2C3E50] mb-2 font-bold hover:text-[#b7853f] transition-colors duration-300 cursor-pointer"
    >
      {name}
    </h3>
    <div
      className="text-[#D4AF37] font-semibold"
      style={{ fontSize: viewMode === 'grid' ? '1.6rem' : '1.2rem' }}
    >
      ₹{typeof price === 'number' ? price.toLocaleString('en-IN') : price}
    </div>
  </div>
)

// Helper function to get category name by ID
const getCategoryNameById = (categoryId, categories) => {
  if (!categoryId || !categories) return null

  // First try to find in the flat array
  const category = categories.find((cat) => cat._id === categoryId)
  if (category) return category.name

  // If not found, search in nested categories
  for (const cat of categories) {
    if (cat.children) {
      const found = cat.children.find((child) => child._id === categoryId)
      if (found) return found.name
    }
  }

  return null
}

const ProductCard = ({
  image: imageUrl,
  brand,
  name,
  price,
  isNew = false,
  discount = null,
  id,
  status = 'in-stock',
  minOrderLimit = 1,
  sideImages = [],
  viewMode = 'grid', // 'grid' or 'list'
  categoryId,
  ...props
}) => {
  const router = useRouter()
  const dispatch = useDispatch()
  const [isHovered, setIsHovered] = useState(false)
  const [hasError, setHasError] = useState(false)
  const { status: productDetailsStatus } = useSelector(
    (state) => state.productDetails,
  )
  const allCategories = useSelector(selectAllCategories)
  const { user } = useAuth()
  const {
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    showAuthModal,
    setShowAuthModal,
    switchToEmail,
  } = useWishlist()

  const categoryName = categoryId
    ? getCategoryNameById(categoryId, allCategories)
    : null

  const handleImageError = () => {
    console.error(`Failed to load image: ${imageUrl}`)
    setHasError(true)
  }

  const handleNavigate = (e) => {
    e.preventDefault()
    e.stopPropagation()
    router.push(`/products/${id}`)
  }

  const stopPropagation = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const { addToCart, cart } = useCart()
  const [isAdding, setIsAdding] = useState(false)

  // Derive wishlist and cart booleans from context instead of mutating state in effects
  const isWishlisted = React.useMemo(() => isInWishlist(id), [id, isInWishlist])
  const isInCart = React.useMemo(
    () => !!cart.find((item) => item.id === id),
    [cart, id],
  )

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()

    setIsAdding(true)

    // Add item to cart
    addToCart(
      {
        id,
        name,
        price,
        image: imageUrl,
        brand,
      },
      1,
    )

    // Show success message
    toast.success('Added to cart!', {
      position: 'bottom-center',
      duration: 2000,
    })

    // Reset button state after animation
    setTimeout(() => {
      setIsAdding(false)
    }, 2000)
  }

  const handleWishlistClick = (e) => {
    e.preventDefault()
    e.stopPropagation()

    const product = {
      id,
      name,
      price,
      image: imageUrl,
      brand,
    }

    if (isWishlisted) {
      removeFromWishlist(id)
      toast.success('Removed from wishlist')
    } else {
      // Check if user is authenticated before adding to wishlist
      const isAuthenticated = !!user

      const success = addToWishlist(product, isAuthenticated)

      if (success) {
        toast.success('Added to wishlist')
      } else if (isAuthenticated) {
        // This handles the case where the product is already in the wishlist
        toast.success('Already in wishlist')
      } else {
        setShowAuthModal(true)
      }
    }
  }

  if (viewMode === 'list') {
    return (
      <>
        {showAuthModal && (
          <AuthModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            onSwitchToEmail={switchToEmail}
          />
        )}
        <div
          className="w-full bg-white p-4 rounded-lg group border border-gray-200 hover:shadow-md transition-all duration-300 flex flex-col md:flex-row gap-4 overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={stopPropagation}
        >
          {/* Image */}
          <div className="w-full max-w-[280px] relative h-48 md:h-64">
            <div className="relative w-full h-full overflow-hidden rounded">
              {!hasError && imageUrl ? (
                <>
                  <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-110">
                    <Image
                      src={imageUrl}
                      alt={name}
                      fill
                      unoptimized={true}
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={handleImageError}
                      sizes="(max-width: 768px) 100vw, 25vw"
                      priority={false}
                    />
                  </div>
                  {/* Hover Overlay */}
                  <div
                    className={`absolute inset-0 bg-black/20 flex flex-col items-center justify-center gap-4 p-4 transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                  >
                    <div className="flex gap-3">
                      <button
                        className={`w-10 h-10 rounded-full bg-[#BA8B4E] flex items-center justify-center ${isWishlisted ? 'text-red-500' : 'text-white'} transition-colors`}
                        onClick={handleWishlistClick}
                      >
                        <FiHeart
                          className={`text-lg ${isWishlisted ? 'fill-current' : ''}`}
                        />
                      </button>
                      <button
                        onClick={handleNavigate}
                        disabled={productDetailsStatus === 'loading'}
                        className={`w-10 h-10 rounded-full bg-[#BA8B4E] flex items-center justify-center hover:bg-[#a87d45] transition-colors shadow-lg ${
                          productDetailsStatus === 'loading'
                            ? 'opacity-70 cursor-not-allowed'
                            : 'cursor-pointer'
                        }`}
                      >
                        {productDetailsStatus === 'loading' ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <FiEye className="text-white text-lg" />
                        )}
                      </button>
                    </div>
                    <div className="relative group/button">
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4/5 h-3 bg-pink-200/30 rounded-full blur-sm group-hover/button:blur-md transition-all duration-300"></div>
                      <button
                        onClick={handleAddToCart}
                        disabled={isAdding || isInCart}
                        className={`relative ${
                          isInCart
                            ? 'bg-[#BA8B4E] hover:bg-[#a87d45]'
                            : 'bg-[#BA8B4E] hover:bg-[#a87d45]'
                        } text-white px-6 py-2 rounded-full text-sm font-medium flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer min-w-[140px]`}
                      >
                        {isAdding ? (
                          <span className="flex items-center">
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                            Adding...
                          </span>
                        ) : isInCart ? (
                          <span className="flex items-center">
                            <FiCheck className="text-white mr-1" size={18} />
                            Added
                          </span>
                        ) : (
                          <>
                            <FiShoppingBag className="text-white" size={16} />
                            ADD TO CART
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <span className="text-gray-500">Image not available</span>
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <ProductInfo
                className="text-left"
                brand={brand}
                name={name}
                price={price}
                viewMode={viewMode}
                handleNavigate={handleNavigate}
                categoryName={categoryName}
              />
              <p className="mt-2 text-gray-600 text-sm line-clamp-2">
                {name} - {brand} - {status}
              </p>
            </div>
          </div>
        </div>
      </>
    )
  }

  // Default grid view
  return (
    <>
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSwitchToEmail={switchToEmail}
        />
      )}
      <div
        className="w-full max-w-[280px] bg-white p-4 rounded-lg group border border-gray-200 hover:shadow-md transition-shadow duration-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={stopPropagation}
      >
        {/* Image Container */}
        <div className="relative w-full pt-[100%] mb-4 overflow-hidden rounded">
          <div className="absolute inset-0 overflow-hidden">
            {!hasError && imageUrl ? (
              <Image
                src={imageUrl}
                alt={name}
                fill
                unoptimized={true}
                className={`object-cover transition-transform duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`}
                onError={handleImageError}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={false}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <span className="text-gray-500">Image not available</span>
              </div>
            )}

            {/* Hover Overlay */}
            <div
              className={`absolute inset-0 bg-black/20 flex flex-col items-center justify-center gap-6 p-4 transition-all duration-500 transform ${
                isHovered
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 -translate-y-full'
              }`}
            >
              <div className="flex gap-4">
                <button
                  className={`w-10 h-10 rounded-full bg-[#BA8B4E] flex items-center justify-center ${isWishlisted ? 'text-red-500' : 'text-white hover:bg-[#BA8B4E]'} transition-colors ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                  onClick={handleWishlistClick}
                >
                  <FiHeart
                    className={`text-lg ${isWishlisted ? 'fill-current' : ''}`}
                  />
                </button>
                <button
                  onClick={handleNavigate}
                  disabled={productDetailsStatus === 'loading'}
                  className={`w-10 h-10 rounded-full bg-[#BA8B4E] flex items-center justify-center hover:bg-[#a87d45] transition-colors shadow-lg ${
                    productDetailsStatus === 'loading'
                      ? 'opacity-70 cursor-not-allowed'
                      : 'cursor-pointer'
                  }`}
                >
                  {productDetailsStatus === 'loading' ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <FiEye className="text-white text-lg" />
                  )}
                </button>
              </div>
              <div className="relative transform transition-transform duration-300 group">
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4/5 h-3 bg-pink-200/30 rounded-full blur-sm group-hover:blur-md transition-all duration-300"></div>
                <button
                  onClick={handleAddToCart}
                  disabled={isAdding || isInCart}
                  className={`relative ${
                    isInCart
                      ? 'bg-[#BA8B4E] hover:bg-[#a87d45]'
                      : 'bg-[#BA8B4E] hover:bg-[#a87d45]'
                  } text-white px-8 py-3 rounded-full text-sm font-medium flex items-center justify-center gap-2 transition-colors shadow-lg cursor-pointer min-w-[140px]`}
                >
                  {isAdding ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                      Adding...
                    </span>
                  ) : isInCart ? (
                    <span className="flex items-center">
                      <FiCheck className="text-white mr-1" size={18} />
                      Added
                    </span>
                  ) : (
                    <>
                      <FiShoppingBag className="text-white" size={16} />
                      ADD TO CART
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="text-center">
          <p className="text-sm text-[#8A9BA8] uppercase tracking-wider mb-1">
            {categoryName || brand}
          </p>
          <h3
            className="text-base text-[#2C3E50] mb-2 font-bold hover:text-[#b7853f] transition-colors duration-300 cursor-pointer"
            onClick={handleNavigate}
          >
            {name}
          </h3>
          <div
            className="text-[#D4AF37] font-semibold"
            style={{ fontSize: '1.6rem' }}
          >
            ₹{typeof price === 'number' ? price.toLocaleString('en-IN') : price}
          </div>
        </div>
      </div>
    </>
  )
}

export default ProductCard
