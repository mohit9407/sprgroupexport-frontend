import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import ProductCard from '@/components/ProductCard'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { fetchProducts } from '@/features/products/productsSlice'
import { toast } from 'react-hot-toast'

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

const RelatedProducts = () => {
  const dispatch = useDispatch()
  const { items: products = [], status } = useSelector(
    (state) => state.products || {},
  )
  const sliderRef = useRef(null)
  const [isHovered, setIsHovered] = useState(false)
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
  // Fetch products on component mount
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProducts())
        .unwrap()
        .catch((error) => {
          console.error('Error fetching products:', error)
          toast.error('Failed to load related products')
        })
    }
  }, [dispatch, status])

  // Map API response to match ProductCard props
  const mappedProducts = (products || []).map((product) => {
    // Ensure we have a valid image URL or fallback to placeholder
    const mainImage =
      product.images?.[0] || product.image || '/images/placeholder-product.png'

    // If the image path is relative, make sure it has the proper base URL
    const getImageUrl = (img) => {
      if (!img) return '/images/placeholder-product.png'
      if (img.startsWith('http') || img.startsWith('/')) return img
      return `/${img}` // Add leading slash if missing
    }

    return {
      id: product._id || product.id,
      name: product.productModel || product.name || 'Unnamed Product',
      price: product.price || 0,
      originalPrice: product.originalPrice || product.price || 0,
      isNew: product.isNew || false,
      brand: product.brand || 'Unknown Brand',
      image: getImageUrl(mainImage), // Use image instead of images[0]
      discount: product.discount || null,
      ...product,
    }
  })

  return (
    <div className="px-4">
      <div className="max-w-7xl mx-auto">
        <div className="container mx-auto px-4 py-16 relative group">
          <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">
            Related Products
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
              <div className="col-span-4 text-center text-gray-500 py-8">
                No related products found.
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
