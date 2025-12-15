import React, { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { FiHeart, FiEye, FiShoppingBag } from 'react-icons/fi'

const ProductCard = ({
  image: imageUrl,
  brand,
  name,
  price,
  isNew = false,
  discount = null,
  id,
}) => {
  const router = useRouter()
  const [isHovered, setIsHovered] = useState(false)
  const [hasError, setHasError] = useState(false)

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

  return (
    <div
      className="w-full max-w-[280px] bg-gray-50 p-4 rounded-lg group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={stopPropagation}
    >
      {/* Image Container */}
      <div className="relative w-full pt-[100%] mb-4 overflow-hidden">
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
                onClick={stopPropagation}
                className="w-10 h-10 rounded-full bg-[#BA8B4E] flex items-center justify-center hover:bg-[#a87d45] transition-colors shadow-lg cursor-pointer"
              >
                <FiHeart className="text-white text-lg" />
              </button>
              <button
                onClick={handleNavigate}
                className="w-10 h-10 rounded-full bg-[#BA8B4E] flex items-center justify-center hover:bg-[#a87d45] transition-colors shadow-lg cursor-pointer"
              >
                <FiEye className="text-white text-lg" />
              </button>
            </div>
            <div className="relative transform transition-transform duration-300 group">
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4/5 h-3 bg-pink-200/30 rounded-full blur-sm group-hover:blur-md transition-all duration-300"></div>
              <button
                onClick={stopPropagation}
                className="relative bg-[#BA8B4E] text-white px-8 py-3 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-[#a87d45] transition-colors shadow-lg cursor-pointer"
              >
                <FiShoppingBag className="text-white" size={16} />
                ADD TO CART
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="text-center">
        <p className="text-sm text-[#8A9BA8] uppercase tracking-wider mb-1">
          {brand}
        </p>
        <h3
          onClick={handleNavigate}
          className="text-base text-[#2C3E50] mb-2 font-bold hover:text-[#b7853f] transition-colors duration-300 cursor-pointer"
        >
          {name}
        </h3>
        <div
          className="text-[#D4AF37] font-semibold"
          style={{ fontSize: '1.6rem' }}
        >
          ₹{price.toLocaleString('en-IN')}
        </div>
      </div>
    </div>
  )
}

export default ProductCard
