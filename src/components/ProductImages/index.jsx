'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import Image from 'next/image'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'

const ProductImages = ({ images, productName, sideImages = [] }) => {
  const [selectedImage, setSelectedImage] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [zoomStyle, setZoomStyle] = useState({})
  const [isModalOpen, setIsModalOpen] = useState(false)
  const videoRef = useRef(null)

  // Combine main images with side images if they exist
  const allImages = React.useMemo(() => {
    const mainImages = Array.isArray(images)
      ? [...images]
      : images
        ? [images]
        : []

    const additionalImages = Array.isArray(sideImages)
      ? sideImages
          .map((img) => {
            // Handle video files
            if (img.type === 'video') {
              return {
                type: 'video',
                url: img.videoUrl,
                thumbnailUrl: img.thumbnailUrl,
                description: img.description || `${productName} video`,
              }
            }
            // Handle image files
            const imgUrl =
              img.mediumUrl || img.largeUrl || img.thumbnailUrl || img.url || ''
            return {
              type: 'image',
              url: imgUrl,
              description: img.description || `${productName} image`,
            }
          })
          .filter((item) => item.url || item.thumbnailUrl)
      : []

    return [...mainImages, ...additionalImages].filter(Boolean)
  }, [images, sideImages, productName])

  // Auto-play video when a video is selected
  useEffect(() => {
    if (allImages[selectedImage]?.type === 'video' && videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.log('Auto-play failed:', error)
      })
    }
  }, [selectedImage, allImages])

  // Image navigation callbacks with proper dependency array
  const nextImage = useCallback(() => {
    if (!allImages?.length) return
    setSelectedImage((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))
  }, [allImages]) // Use the allImages array as dependency

  const prevImage = useCallback(() => {
    if (!allImages?.length) return
    setSelectedImage((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))
  }, [allImages]) // Use the allImages array as dependency

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

  if (allImages.length === 0) {
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
              {allImages[selectedImage]?.type === 'video' ? (
                <>
                  <video
                    src={allImages[selectedImage].url}
                    poster={allImages[selectedImage].thumbnailUrl}
                    className="w-full h-full object-contain"
                    controls
                    muted
                    playsInline
                    onClick={(e) => {
                      e.preventDefault()
                      const video = e.target
                      if (video.paused) {
                        video.play()
                      } else {
                        video.pause()
                      }
                    }}
                  />
                </>
              ) : (
                <Image
                  src={
                    allImages[selectedImage]?.url || allImages[selectedImage]
                  }
                  alt={productName}
                  fill
                  style={{ objectFit: 'contain' }}
                  className="object-contain"
                  unoptimized={process.env.NODE_ENV !== 'production'}
                  priority
                />
              )}
            </div>

            {/* Thumbnail Navigation */}
            <div className="flex justify-center mt-4 space-x-2">
              {allImages.map((img, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedImage(index)
                  }}
                  className={`w-16 h-16 flex-shrink-0 border-2 transition-all relative ${
                    selectedImage === index
                      ? 'border-[#b7853f]'
                      : 'border-transparent'
                  }`}
                  aria-label={`View ${img.type === 'video' ? 'video' : 'image'} ${index + 1}`}
                >
                  <div className="relative w-full h-full p-1">
                    <Image
                      src={
                        img.type === 'video' ? img.thumbnailUrl : img.url || img
                      }
                      alt={
                        img.description ||
                        `${productName} ${img.type === 'video' ? 'video' : 'image'} ${index + 1}`
                      }
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
              backgroundImage: `url(${allImages[selectedImage]})`,
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
            {allImages[selectedImage]?.type === 'video' ? (
              <>
                <video
                  ref={videoRef}
                  src={allImages[selectedImage].url}
                  poster={allImages[selectedImage].thumbnailUrl}
                  className="w-full h-full object-contain"
                  controls
                  muted
                  playsInline
                  autoPlay
                  onClick={(e) => {
                    e.preventDefault()
                    const video = e.target
                    if (video.paused) {
                      video.play()
                    } else {
                      video.pause()
                    }
                  }}
                />
              </>
            ) : (
              <Image
                src={allImages[selectedImage]?.url || allImages[selectedImage]}
                alt={productName}
                fill
                style={{ objectFit: 'contain' }}
                className="object-contain transition-opacity duration-300"
                priority
                unoptimized={process.env.NODE_ENV !== 'production'}
              />
            )}
            {isHovered && (
              <div
                className="absolute inset-0 bg-cover bg-no-repeat"
                style={{
                  ...zoomStyle,
                  backgroundImage:
                    allImages[selectedImage]?.type === 'video'
                      ? `url(${allImages[selectedImage].thumbnailUrl})`
                      : zoomStyle.backgroundImage,
                }}
              />
            )}
          </div>

          {/* Thumbnail Navigation Dots */}
          {allImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
              {allImages.map((_, index) => (
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
          )}
        </div>

        {/* Thumbnail Navigation */}
        <div
          className="relative py-4 group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Previous Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              const prevIndex =
                selectedImage === 0 ? allImages.length - 1 : selectedImage - 1
              setSelectedImage(prevIndex)
            }}
            className={`absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-[#b7853f] text-white hover:bg-[#a07536] transition-all duration-300 z-10
						${isHovered ? 'opacity-100 translate-x-2' : 'opacity-0 -translate-x-2'}`}
            aria-label="Previous thumbnail"
          >
            <FaChevronLeft className="w-3 h-3" />
          </button>

          <div className="flex space-x-3 justify-center">
            {allImages.map((img, index) => {
              // Only show a few thumbnails around the selected one
              const totalThumbnails = Math.min(5, allImages.length)
              const half = Math.floor(totalThumbnails / 2)
              let start = Math.max(0, selectedImage - half)
              start = Math.min(start, allImages.length - totalThumbnails)
              const end = Math.min(start + totalThumbnails, allImages.length)

              if (index < start || index >= end) return null

              const imgSrc =
                img.type === 'video' ? img.thumbnailUrl : img.url || img
              return (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  onMouseEnter={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 transition-all duration-300 ease-in-out transform hover:scale-105 cursor-pointer relative ${
                    selectedImage === index
                      ? 'ring-2 ring-[#b7853f]'
                      : 'border border-gray-200 hover:border-[#b7853f]'
                  }`}
                  aria-label={`Select ${img.type === 'video' ? 'video' : 'image'} ${index + 1}`}
                >
                  <div className="relative w-full h-full p-1">
                    <Image
                      src={imgSrc}
                      alt={
                        img.description ||
                        `${productName} ${img.type === 'video' ? 'video' : 'image'} ${index + 1}`
                      }
                      fill
                      style={{ objectFit: 'cover' }}
                      className="w-full h-full"
                      unoptimized={process.env.NODE_ENV !== 'production'}
                    />
                    {img.type === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="bg-black/50 rounded-full p-1.5">
                          <svg
                            className="w-4 h-4 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Next Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              const nextIndex =
                selectedImage === allImages.length - 1 ? 0 : selectedImage + 1
              setSelectedImage(nextIndex)
            }}
            className={`absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-[#b7853f] text-white hover:bg-[#a07536] transition-all duration-300 z-10
						${isHovered ? 'opacity-100 -translate-x-2' : 'opacity-0 translate-x-2'}`}
            aria-label="Next thumbnail"
          >
            <FaChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductImages
