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
        'Unable to access image after 3 attempts: ',
        src,
        '\nShowing fallback image: ',
        fallback,
      )
    }
  }

  // Don't render Image component if src is null/undefined and no fallback
  if (!src && !fallback) {
    return (
      <div className="bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
        No image
      </div>
    )
  }

  // Convert relative URLs to absolute URLs for development
  let imageSrc = isImageError || !src ? fallback : src

  // Handle old Vercel Blob URLs - convert to local URLs
  if (
    imageSrc.includes('vercel-storage.com') ||
    imageSrc.includes('blob.vercel-storage.com')
  ) {
    // Extract the file path from Vercel URL
    // Example: https://vos43ibt37cj25fd.public.blob.vercel-storage.com/media/thumbnail/filename.jpg
    const urlParts = imageSrc.split('/')
    const mediaIndex = urlParts.findIndex((part) => part === 'media')

    if (mediaIndex !== -1 && urlParts.length > mediaIndex + 1) {
      // Reconstruct as local URL
      const localPath = '/uploads/' + urlParts.slice(mediaIndex).join('/')
      imageSrc = `${API_BASE_URL}${localPath}`
      console.log(
        'SafeImage: Converting Vercel URL:',
        src,
        'to local URL:',
        imageSrc,
      )
    }
  }
  // If it's a relative URL (starts with /uploads/), convert to absolute URL
  else if (imageSrc.startsWith('/uploads/')) {
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
