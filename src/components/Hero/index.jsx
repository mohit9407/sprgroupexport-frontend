'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FaArrowRightLong, FaArrowLeftLong } from 'react-icons/fa6'
import SafeImage from '../SafeImage'
import {
  fetchHomeSliders,
  selectHomeSliders,
} from '@/features/home-slider/homeSliderSlice'

const Hero = () => {
  const dispatch = useDispatch()
  const homeSliders = useSelector(selectHomeSliders)

  // Create heroSlides array from home slider data or fallback to static defaults
  const heroSlides =
    homeSliders && homeSliders.length > 0
      ? homeSliders.map((slider) => ({
          src: slider.sliderVideo || slider.sliderImage,
          isVideo: !!slider.sliderVideo,
          title: slider.title || 'SPR Group Export',
          subtitle:
            slider.description || 'Your trusted partner in international trade',
          highlightText: null,
          buttonText: 'Shop Now',
          buttonLink: '/shop',
        }))
      : [
          {
            src: '/3977.mp4',
            isVideo: true,
            title: 'SPR Group Export',
            subtitle: 'Your trusted partner in international trade',
            highlightText: 'New Arrivals',
            buttonText: 'Shop Now',
            buttonLink: '/shop',
          },
          {
            src: '/3971.mp4',
            isVideo: true,
            title: 'SPR Group Export',
            subtitle: 'Your trusted partner in international trade',
            highlightText: null,
            buttonText: 'Shop Now',
            buttonLink: '/shop',
          },
          {
            src: '/3969.jpg',
            isVideo: false,
            title: 'SPR Group Export',
            subtitle: 'Your trusted partner in international trade',
            highlightText: null,
            buttonText: 'Shop Now',
            buttonLink: '/shop',
          },
          {
            src: '/3975.jpg',
            isVideo: false,
            title: 'SPR Group Export',
            subtitle: 'Your trusted partner in international trade',
            highlightText: null,
            buttonText: 'Shop Now',
            buttonLink: '/shop',
          },
        ]

  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isHovered, setIsHovered] = useState(false)

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1))
  }, [heroSlides.length])

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1))
  }, [heroSlides.length])

  const goToSlide = (index) => {
    setCurrentSlide(index)
  }

  // Fetch home sliders on component mount
  useEffect(() => {
    dispatch(fetchHomeSliders())
  }, [dispatch])

  // Preload images on component mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    heroSlides.forEach((slide) => {
      if (!slide.isVideo) {
        const img = new window.Image()
        img.src = slide.src
      }
    })
  }, [heroSlides])

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
      className="relative z-10 w-full h-screen group"
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
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-10'
            }`}
          >
            <div className="relative w-full h-full">
              {slide.isVideo ? (
                <video
                  src={slide.src}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : (
                <SafeImage
                  src={slide.src}
                  alt={slide.title}
                  fill
                  priority={index === 0}
                  sizes="100vw"
                  quality={75}
                />
              )}
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
