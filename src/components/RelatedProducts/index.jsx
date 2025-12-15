import React, { useEffect, useRef, useState } from 'react'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import ProductCard from '@/components/ProductCard'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'

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
  // Dummy data - you can replace this with actual data from props or API
  const relatedProducts = [
    {
      id: 'dummy1',
      name: 'Diamond Solitaire Ring',
      price: 250000,
      originalPrice: 300000,
      isNew: true,
      brand: 'Pramukh Raj',
      images: ['/bg1.jpg'],
    },
    {
      id: 'dummy2',
      name: 'Gold Plated Earrings',
      price: 120000,
      originalPrice: 150000,
      isNew: false,
      brand: 'Pramukh Raj',
      images: ['/bg2.jpg'],
    },
    {
      id: 'dummy3',
      name: 'Platinum Necklace',
      price: 450000,
      originalPrice: 500000,
      isNew: true,
      brand: 'Pramukh Raj',
      images: ['/bg3.jpg'],
    },
    {
      id: 'dummy4',
      name: 'Silver Bracelet',
      price: 80000,
      originalPrice: 100000,
      isNew: false,
      brand: 'Pramukh Raj',
      images: ['/bg1.jpg'],
    },
    {
      id: 'dummy5',
      name: 'Gold Pendant',
      price: 180000,
      originalPrice: 200000,
      isNew: true,
      brand: 'Pramukh Raj',
      images: ['/bg2.jpg'],
    },
    {
      id: 'dummy6',
      name: 'Diamond Earrings',
      price: 320000,
      originalPrice: 350000,
      isNew: false,
      brand: 'Pramukh Raj',
      images: ['/bg3.jpg'],
    },
  ]

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
            {relatedProducts.map((product) => (
              <div key={product.id} className="px-2">
                <div className="h-full">
                  <ProductCard
                    id={product.id}
                    image={product.images[0]}
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
            ))}
          </Slider>
        </div>
      </div>
    </div>
  )
}

export default RelatedProducts
