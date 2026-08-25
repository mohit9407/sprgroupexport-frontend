import SafeImage from '../SafeImage'
import Link from 'next/link'
import { useState, useEffect } from 'react'

const CategoryCard = ({
  title,
  imageUrl,
  href = '#',
  className = '',
  isVideo = false,
  videoUrl = null,
}) => {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Reset loading and error states when imageUrl changes
    setIsLoading(true)
    setHasError(false)
  }, [imageUrl, videoUrl])

  const handleImageError = (e) => {
    setHasError(true)
    setIsLoading(false)
  }

  const handleImageLoad = () => {
    setIsLoading(false)
    setHasError(false)
  }

  const handleVideoLoad = () => {
    setIsLoading(false)
  }

  const handleVideoError = (e) => {
    setIsLoading(false)
  }

  return (
    <div className="h-full w-full">
      <div
        className={`group relative block overflow-hidden w-full h-full rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer ${className}`}
        onClick={() => (window.location.href = href)}
      >
        <div className="relative w-[453.75px] h-[453.75px] max-w-full mx-auto bg-gray-100">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="animate-pulse w-full h-full bg-gray-200"></div>
            </div>
          )}

          {!hasError && (imageUrl || (isVideo && videoUrl)) ? (
            isVideo && videoUrl ? (
              <video
                src={videoUrl}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                muted
                autoPlay
                loop
                playsInline
                onLoadedData={handleVideoLoad}
                onError={handleVideoError}
              />
            ) : (
              <SafeImage
                src={imageUrl}
                alt={title || 'Category image'}
                fill
                unoptimized={true}
                className={`object-cover transition-transform duration-500 group-hover:scale-105 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                onError={handleImageError}
                onLoad={handleImageLoad}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={false}
              />
            )
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <span className="text-gray-500 text-sm">Image not available</span>
            </div>
          )}
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-all duration-300" />

          {/* Bottom Title Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-[25px] bg-[#b7853f] bg-opacity-95 flex items-center justify-center transition-all duration-300 group-hover:bg-opacity-100">
            <h3 className="text-white text-sm font-medium uppercase tracking-wider">
              {title}
            </h3>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CategoryCard
