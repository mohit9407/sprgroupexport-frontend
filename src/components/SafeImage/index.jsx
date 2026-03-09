'use client'

import Image from 'next/image'
import React, { useRef, useState } from 'react'
import { API_BASE_URL } from '@/lib/axios'

const SafeImage = ({
  src,
  fallback = '/images/placeholder-product.png',
  ...rest
}) => {
  const errorCount = useRef(0)
  const [isImageError, setIsImageError] = useState(false)

  const handleOnError = () => {
    errorCount.current += 1
    if (errorCount.current <= 3) {
      console.warn(`Image failed to load (attempt ${errorCount.current}):`, src)
    } else {
      setIsImageError(true)
      console.error(
        'Unable to access image after 3 attempts:',
        src,
        '\nShowing fallback image:',
        fallback,
      )
    }
  }

  // If no src and no fallback
  if (!src && !fallback) {
    return (
      <div className="bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
        No image
      </div>
    )
  }

  // Use fallback if image fails
  let imageSrc = isImageError || !src ? fallback : src

  // Convert relative uploads path to full API URL
  if (imageSrc?.startsWith('/uploads/')) {
    imageSrc = `${API_BASE_URL}${imageSrc}`
  }

  return (
    <Image
      {...rest}
      src={imageSrc}
      onError={handleOnError}
      unoptimized={
        imageSrc?.startsWith('http://localhost') ||
        imageSrc?.startsWith('http://127.0.0.1')
      }
    />
  )
}

export default SafeImage
