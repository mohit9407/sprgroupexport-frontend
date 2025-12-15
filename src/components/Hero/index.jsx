'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { FaArrowRightLong, FaArrowLeftLong } from 'react-icons/fa6'

const Hero = () => {
  // Define image sources
  const heroImages = ['/hero2.jpg', '/hero3.jpg', '/hero4.jpg', '/hero5.jpg']

  // Create heroSlides array with the images and content
  const heroSlides = heroImages.map((src, index) => ({
    src,
    title: 'SPR Group Export',
    subtitle: 'Your trusted partner in international trade',
    highlightText: index === 0 ? 'New Arrivals' : null,
    buttonText: 'Shop Now',
    buttonLink: '/shop',
  }))

  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isHovered, setIsHovered] = useState(false)

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === heroImages.length - 1 ? 0 : prev + 1))
  }, [heroImages.length])

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? heroImages.length - 1 : prev - 1))
  }, [heroImages.length])

  const goToSlide = (index) => {
    setCurrentSlide(index)
  }

  // Preload images on component mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    heroImages.forEach((src) => {
      const img = new window.Image()
      img.src = src
    })
  }, [heroImages])

  // Auto slide functionality
  useEffect(() => {
    if (!isAutoPlaying) return

    const timer = setInterval(() => {
      nextSlide()
    }, 5000)

    return () => clearInterval(timer)
  }, [isAutoPlaying, nextSlide])

  return (
    <section
      className="relative w-full h-screen group z-1"
      onMouseEnter={() => {
        setIsAutoPlaying(false)
        setIsHovered(true)
      }}
      onMouseLeave={() => {
        setIsAutoPlaying(true)
        setIsHovered(false)
      }}
    >
      {/* Slides */}
      <div className="relative w-full min-h-screen">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="relative w-full h-full">
              <Image
                src={slide.src}
                alt={slide.title}
                fill
                priority={index === 0}
                sizes="100vw"
                quality={75}
                unoptimized={process.env.NODE_ENV !== 'production'}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <div
        className={`absolute inset-0 flex items-center justify-between px-4 z-10 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
      >
        <button
          onClick={prevSlide}
          className="group p-3 bg-[#BA8B4E] hover:bg-[#a87d45] transition-all duration-300 transform hover:scale-105 shadow-lg"
          aria-label="Previous slide"
        >
          <FaArrowLeftLong className="text-white text-xl md:text-2xl transition-transform duration-300 group-hover:-translate-x-1" />
        </button>

        <button
          onClick={nextSlide}
          className="group p-3 bg-[#BA8B4E] hover:bg-[#a87d45] transition-all duration-300 transform hover:scale-105 shadow-lg"
          aria-label="Next slide"
        >
          <FaArrowRightLong className="text-white text-xl md:text-2xl transition-transform duration-300 group-hover:translate-x-1" />
        </button>
      </div>

      {/* Dots Navigation */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-1.5 transition-all duration-300 cursor-pointer rounded-full ${
              index === currentSlide
                ? 'w-8 bg-[#BA8B4E]' // Active slide - golden-brown color
                : 'w-3 bg-white/60 hover:bg-white/80' // Inactive slides - light grey with hover
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}

export default Hero
