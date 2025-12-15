'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'

const ProductImages = ({ images, productName }) => {
  const [selectedImage, setSelectedImage] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [zoomStyle, setZoomStyle] = useState({})
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Image navigation callbacks with proper dependency array
  const nextImage = useCallback(() => {
    if (!images?.length) return
    setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }, [images]) // Use the full images array as dependency

  const prevImage = useCallback(() => {
    if (!images?.length) return
    setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }, [images]) // Use the full images array as dependency

  // Handle keyboard navigation with useCallback
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'ArrowRight') nextImage()
      else if (e.key === 'ArrowLeft') prevImage()
    },
    [nextImage, prevImage],
  ) // Add dependencies to prevent unnecessary recreations

  // Close modal when clicking outside the image
  const closeModal = useCallback((e) => {
    if (e.target.id === 'image-modal') {
      setIsModalOpen(false)
    }
  }, []) // No dependencies needed as it only uses setIsModalOpen

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-100 flex items-center justify-center">
        <span className="text-gray-500">No images available</span>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Image Modal */}
      {isModalOpen && (
        <div
          id="image-modal"
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 cursor-zoom-out"
          onClick={closeModal}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <div className="relative max-w-4xl w-full h-[80vh]">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 text-2xl z-10"
              aria-label="Close modal"
            >
              ✕
            </button>
            <div className="relative w-full h-full">
              <Image
                src={images[selectedImage]}
                alt={productName}
                fill
                style={{ objectFit: 'contain' }}
                className="object-contain"
                unoptimized={process.env.NODE_ENV !== 'production'}
                priority
              />
            </div>

            {/* Thumbnail Navigation */}
            <div className="flex justify-center mt-4 space-x-2">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedImage(index)
                  }}
                  className={`w-16 h-16 flex-shrink-0 border-2 transition-all ${
                    selectedImage === index
                      ? 'border-[#b7853f]'
                      : 'border-transparent'
                  }`}
                  aria-label={`View image ${index + 1}`}
                >
                  <div className="relative w-full h-full p-1">
                    <Image
                      src={img}
                      alt={`${productName} thumbnail ${index + 1}`}
                      fill
                      style={{ objectFit: 'cover' }}
                      className="w-full h-full"
                      unoptimized={process.env.NODE_ENV !== 'production'}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="p-4 rounded-lg shadow">
        <div
          className={`relative w-full h-96 mb-4 overflow-hidden rounded-lg ${
            isHovered ? 'cursor-zoom-out' : 'cursor-zoom-in'
          }`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => {
            setIsHovered(false)
            setZoomStyle({ ...zoomStyle, opacity: 0 })
          }}
          onMouseMove={(e) => {
            if (!isHovered) return

            const container = e.currentTarget.getBoundingClientRect()
            const x = ((e.clientX - container.left) / container.width) * 100
            const y = ((e.clientY - container.top) / container.height) * 100

            setZoomStyle({
              display: 'block',
              backgroundImage: `url(${images[selectedImage]})`,
              backgroundPosition: `${x}% ${y}%`,
              backgroundSize: '200%',
              backgroundRepeat: 'no-repeat',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 5,
              opacity: 1,
              transition: 'opacity 0.3s ease',
              transform: 'scale(1.5)',
              transformOrigin: `${x}% ${y}%`,
            })
          }}
        >
          {/* Main Image */}
          <div
            className="relative w-full h-full cursor-pointer"
            onClick={() => setIsModalOpen(true)}
          >
            <Image
              src={images[selectedImage]}
              alt={productName}
              fill
              style={{ objectFit: 'contain' }}
              className="object-contain transition-opacity duration-300"
              priority
              unoptimized={process.env.NODE_ENV !== 'production'}
            />
            {isHovered && (
              <div
                className="absolute inset-0 bg-cover bg-no-repeat"
                style={zoomStyle}
              />
            )}
          </div>

          {/* Navigation Arrows */}
          {isHovered && images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  prevImage()
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-[#b7853f] text-white p-3 hover:bg-[#a07536] transition-all transform hover:scale-105 z-10 w-10 h-10 flex items-center justify-center cursor-pointer"
                aria-label="Previous image"
              >
                <FaChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  nextImage()
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#b7853f] text-white p-3 hover:bg-[#a07536] transition-all transform hover:scale-105 z-10 w-10 h-10 flex items-center justify-center cursor-pointer"
                aria-label="Next image"
              >
                <FaChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Thumbnail Navigation */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedImage(index)
                }}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  selectedImage === index
                    ? 'bg-[#b7853f] w-8'
                    : 'bg-white/70 hover:bg-white'
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-center space-x-4 py-4 overflow-x-auto scrollbar-hide">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              onMouseEnter={() => setSelectedImage(index)}
              className={`flex-shrink-0 w-20 h-20 transition-all duration-300 ease-in-out transform hover:scale-105 cursor-pointer ${
                selectedImage === index
                  ? 'ring-2 ring-[#b7853f]'
                  : 'border border-gray-200 hover:border-[#b7853f]'
              }`}
              aria-label={`Select image ${index + 1}`}
            >
              <div className="relative w-full h-full p-1">
                <Image
                  src={img}
                  alt={`${productName} thumbnail ${index + 1}`}
                  fill
                  style={{ objectFit: 'cover' }}
                  className="w-full h-full"
                  unoptimized={process.env.NODE_ENV !== 'production'}
                />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ProductImages
