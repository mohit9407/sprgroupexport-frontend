import React, { useEffect, useRef, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import ProductCard from '@/components/ProductCard'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { fetchProducts } from '@/features/products/productsSlice'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/context/AuthContext'
import { useWishlist } from '@/context/WishlistContext'

// Custom arrow components for the slider
const NextArrow = ({ className, style, onClick, isHovered }) => {
  return (
    <div
      className={`absolute right-2 top-1/2 -translate-y-1/2 bg-[#b7853f] text-white p-3 hover:bg-[#a07536] transition-all transform hover:scale-105 z-10 w-10 h-10 flex items-center justify-center cursor-pointer ${
        isHovered ? 'opacity-100' : 'opacity-0'
      } transition-opacity duration-300`}
      style={{ ...style, display: 'flex' }}
      onClick={onClick}
      aria-label="Next slide"
    >
      <FaChevronRight className="text-white w-4 h-4" />
    </div>
  )
}

const PrevArrow = ({ className, style, onClick, isHovered }) => {
  return (
    <div
      className={`absolute left-2 top-1/2 -translate-y-1/2 bg-[#b7853f] text-white p-3 hover:bg-[#a07536] transition-all transform hover:scale-105 z-10 w-10 h-10 flex items-center justify-center cursor-pointer ${
        isHovered ? 'opacity-100' : 'opacity-0'
      } transition-opacity duration-300`}
      style={{ ...style, display: 'flex' }}
      onClick={onClick}
      aria-label="Previous slide"
    >
      <FaChevronLeft className="text-white w-4 h-4" />
    </div>
  )
}

const RelatedProducts = ({ category, excludeProductId }) => {
  const dispatch = useDispatch()
  const { items: products = [], status } = useSelector(
    (state) => state.products || {},
  )
  const sliderRef = useRef(null)
  const [isHovered, setIsHovered] = useState(false)
  const [localLikes, setLocalLikes] = useState({})
  const { isInWishlist } = useWishlist()
  const autoPlaySpeed = 3000 // 3 seconds

  useEffect(() => {
    // Auto slide functionality
    const slider = sliderRef.current
    let interval

    if (slider) {
      interval = setInterval(() => {
        slider.slickNext()
      }, autoPlaySpeed)
    }

    // Pause autoplay when hovering over the slider
    const sliderElement = document.querySelector('.related-products-slider')
    const pauseOnHover = () => {
      if (interval) {
        clearInterval(interval)
      }
    }
    const resumeOnLeave = () => {
      interval = setInterval(() => {
        if (slider) {
          slider.slickNext()
        }
      }, autoPlaySpeed)
    }

    if (sliderElement) {
      sliderElement.addEventListener('mouseenter', pauseOnHover)
      sliderElement.addEventListener('mouseleave', resumeOnLeave)
    }

    return () => {
      if (interval) clearInterval(interval)
      if (sliderElement) {
        sliderElement.removeEventListener('mouseenter', pauseOnHover)
        sliderElement.removeEventListener('mouseleave', resumeOnLeave)
      }
    }
  }, [autoPlaySpeed])
  // Get current user from auth context
  const { user } = useAuth()
  const currentUserId = user?._id

  // Update local likes when products, wishlist, or isInWishlist changes
  useEffect(() => {
    let timer
    if (products && products.length > 0) {
      const initialLikes = {}
      products.forEach((product) => {
        const productId = product._id || product.id
        // Use isInWishlist from context to determine if product is liked
        initialLikes[productId] = isInWishlist(productId)
      })
      timer = setTimeout(() => {
        setLocalLikes((prevLikes) => ({
          ...prevLikes,
          ...initialLikes,
        }))
      }, 0)
    }
    return () => clearTimeout(timer)
  }, [products, isInWishlist])

  // Fetch products on component mount
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProducts())
        .unwrap()
        .catch((error) => {
          toast.error('Failed to load related products')
        })
    }
  }, [dispatch, status])

  // Filter products by category and exclude current product
  const filteredProducts = products.filter((product) => {
    if (!product) return false

    // Get IDs as strings for consistent comparison
    const productId = String(product.id || product._id || '').trim()
    const excludeId = String(excludeProductId || '').trim()

    // Check if this is the current product
    if (excludeId && productId === excludeId) {
      return false
    }

    // If category is provided, filter by category
    if (category) {
      const getCategoryId = (cat) => {
        if (!cat) return null
        if (typeof cat === 'string') return cat.trim()
        if (cat._id) return String(cat._id).trim()
        return String(cat).trim()
      }

      const productCategoryId = getCategoryId(
        product.category || product.categoryId || product.categoryData,
      )
      const currentCategoryId = getCategoryId(category)

      return (
        productCategoryId &&
        currentCategoryId &&
        productCategoryId === currentCategoryId
      )
    }

    return true
  })

  const mappedProducts = useMemo(() => {
    return (filteredProducts || []).map((product) => {
      // Ensure we have a valid image URL or fallback to placeholder
      const mainImage =
        product.images?.[0] ||
        product.image ||
        '/images/placeholder-product.png'

      // If the image path is relative, make sure it has the proper base URL
      const getImageUrl = (img) => {
        if (!img) return '/images/placeholder-product.png'
        const imgStr = String(img) // Convert to string to ensure startsWith is available
        if (imgStr.startsWith('http') || imgStr.startsWith('/')) return imgStr
        return `/${imgStr}` // Add leading slash if missing
      }

      const productId = product._id || product.id
      // Use isInWishlist from context to determine if product is liked
      const isLiked = isInWishlist(productId) || localLikes[productId] || false

      return {
        id: productId,
        name: product.productName || 'Unnamed Product',
        price: product.price || 0,
        originalPrice: product.originalPrice || product.price || 0,
        isNew: product.isNew || false,
        brand: product.brand || 'Unknown Brand',
        image: getImageUrl(mainImage),
        discount: product.discount || null,
        status: product.status || 'in-stock',
        minOrderLimit: product.minOrderLimit || 1,
        sideImages: product.sideImages || [],
        categoryId: product.category,
        isLiked,
        onLikeStatusChange: (productId, newLikeStatus) => {
          setLocalLikes((prev) => ({
            ...prev,
            [productId]: newLikeStatus,
          }))

          // Update the wishlist context
          if (newLikeStatus) {
            // If liked, we don't need to do anything special here as the wishlist context will handle it
          } else {
            // If unliked, we need to ensure the local state stays in sync
            // The wishlist context will handle the actual removal
          }
        },
        ...product,
      }
    })
  }, [filteredProducts, localLikes, isInWishlist])

  return (
    <div className="px-4">
      <div className="max-w-7xl mx-auto">
        <div className="container mx-auto px-4 relative group">
          <h2 className="text-3xl font-bold text-center mb-4 text-gray-800">
            {category && typeof category === 'string' && !category.includes(' ')
              ? 'Related Products'
              : `More ${category || 'Related Products'}`}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-center">
            Discover more stunning pieces that complement your selection
          </p>
        </div>

        <div
          className="relative group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Slider
            ref={sliderRef}
            className="related-products-slider relative group px-12"
            autoplay={true}
            autoplaySpeed={autoPlaySpeed}
            pauseOnHover={true}
            speed={500}
            arrows={true}
            dots={true}
            infinite={true}
            slidesToShow={4}
            slidesToScroll={1}
            initialSlide={0}
            nextArrow={<NextArrow isHovered={isHovered} />}
            prevArrow={<PrevArrow isHovered={isHovered} />}
            responsive={[
              {
                breakpoint: 1280,
                settings: {
                  slidesToShow: 4,
                  slidesToScroll: 1,
                },
              },
              {
                breakpoint: 1024,
                settings: {
                  slidesToShow: 3,
                  slidesToScroll: 1,
                },
              },
              {
                breakpoint: 768,
                settings: {
                  slidesToShow: 2,
                  slidesToScroll: 1,
                },
              },
              {
                breakpoint: 480,
                settings: {
                  slidesToShow: 1,
                  slidesToScroll: 1,
                },
              },
            ]}
            appendDots={(dots) => (
              <div className="mt-8">
                <ul className="flex justify-center space-x-2 m-0 p-0">
                  {dots}
                </ul>
              </div>
            )}
            customPaging={() => (
              <button className="w-2 h-2 rounded-full bg-gray-300 mx-1 focus:outline-none transition-all duration-200"></button>
            )}
            dotsClass="slick-dots"
          >
            {status === 'loading' || status === 'idle' ? (
              // Show loading skeleton or placeholder
              Array(4)
                .fill(0)
                .map((_, index) => (
                  <div key={`loading-${index}`} className="px-2">
                    <div
                      className="h-full bg-gray-100 rounded-lg animate-pulse"
                      style={{ height: '400px' }}
                    />
                  </div>
                ))
            ) : status === 'failed' ? (
              <div className="col-span-4 text-center text-red-500 py-8">
                Failed to load related products. Please try again later.
              </div>
            ) : mappedProducts.length === 0 ? (
              <div className="w-full py-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 mx-auto mb-4 text-gray-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Related Products Available
                  </h3>
                  <p className="text-gray-500 mb-6">
                    We couldn&apos;t find any related products at the moment.
                    Check back later or explore our collection.
                  </p>
                  <button
                    onClick={() => router.push('/products')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#b7853f] hover:bg-[#9a7135] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#b7853f]"
                  >
                    Browse All Products
                  </button>
                </div>
              </div>
            ) : (
              mappedProducts.map((product) => (
                <div key={product.id} className="px-2">
                  <div className="h-full">
                    <ProductCard
                      id={product.id}
                      image={product.image}
                      name={product.name}
                      price={product.price}
                      discount={
                        product.originalPrice
                          ? Math.round(
                              ((product.originalPrice - product.price) /
                                product.originalPrice) *
                                100,
                            )
                          : null
                      }
                      isNew={product.isNew}
                      brand={product.brand}
                      isLiked={product.isLiked}
                      onLikeStatusChange={product.onLikeStatusChange}
                      status={product.status}
                      minOrderLimit={product.minOrderLimit}
                      sideImages={product.sideImages}
                      categoryId={product.categoryId}
                    />
                  </div>
                </div>
              ))
            )}
          </Slider>
        </div>
      </div>
    </div>
  )
}

export default RelatedProducts
