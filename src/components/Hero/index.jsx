'use client'

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FaArrowRightLong, FaArrowLeftLong } from 'react-icons/fa6'
import SafeImage from '../SafeImage'
import {
  fetchHomeSliders,
  selectHomeSliders,
  selectHomeSliderStatus,
} from '@/features/home-slider/homeSliderSlice'

const Hero = () => {
  const dispatch = useDispatch()
  const homeSliders = useSelector(selectHomeSliders)
  const status = useSelector(selectHomeSliderStatus)
  const error = useSelector((state) => state.homeSlider?.error)
  const fetchStartedRef = useRef(false)

  const heroSlides = useMemo(
    () =>
      (homeSliders || [])
        .map((slider) => {
          const src = slider.sliderVideo || slider.sliderImage
          return src
            ? {
                id: slider._id,
                src,
                isVideo: Boolean(slider.sliderVideo),
                title: slider.title || 'SPR Group Export',
              }
            : null
        })
        .filter(Boolean),
    [homeSliders],
  )

  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isHovered, setIsHovered] = useState(false)

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev >= heroSlides.length - 1 ? 0 : prev + 1))
  }, [heroSlides.length])

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) =>
      prev === 0 ? Math.max(heroSlides.length - 1, 0) : prev - 1,
    )
  }, [heroSlides.length])

  const goToSlide = (index) => {
    setCurrentSlide(index)
  }

  // Fetch home sliders on component mount
  useEffect(() => {
    if (status === 'idle' && !fetchStartedRef.current) {
      fetchStartedRef.current = true
      dispatch(fetchHomeSliders())
    }
  }, [dispatch, status])

  useEffect(() => {
    setCurrentSlide((index) =>
      Math.min(index, Math.max(heroSlides.length - 1, 0)),
    )
  }, [heroSlides.length])

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
    if (!isAutoPlaying || heroSlides.length < 2) return

    const timer = setInterval(() => {
      nextSlide()
    }, 5000)

    return () => clearInterval(timer)
  }, [isAutoPlaying, nextSlide, heroSlides.length])

  if (status === 'loading' || status === 'idle') {
    return (
      <section className="relative z-10 flex h-[68vh] min-h-105 max-h-170 w-full items-center justify-center bg-gray-100">
        <p className="text-gray-600">Loading home slider...</p>
      </section>
    )
  }

  if (status === 'failed' || heroSlides.length === 0) {
    const errorMessage =
      typeof error === 'string'
        ? error
        : error?.message ||
          error?.error ||
          'No home slider banners are available.'

    return (
      <section className="relative z-10 flex h-[68vh] min-h-105 max-h-170 w-full items-center justify-center bg-gray-100 px-4">
        <p className="text-center text-red-600" role="alert">
          {errorMessage}
        </p>
      </section>
    )
  }

  return (
    <section
      className="relative z-10 w-full h-[68vh] min-h-105 max-h-170 group"
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
      <div className="relative w-full h-full">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id || slide.src}
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
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/30 to-transparent"></div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {heroSlides.length > 1 && (
        <div
          className={`absolute inset-0 flex items-center justify-between px-4 z-10 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
        >
          <button
            onClick={prevSlide}
            className="group p-3 bg-[#004372] hover:bg-[#003451] transition-all duration-300 transform hover:scale-105 shadow-lg"
            aria-label="Previous slide"
          >
            <FaArrowLeftLong className="text-white text-xl md:text-2xl transition-transform duration-300 group-hover:-translate-x-1" />
          </button>

          <button
            onClick={nextSlide}
            className="group p-3 bg-[#004372] hover:bg-[#003451] transition-all duration-300 transform hover:scale-105 shadow-lg"
            aria-label="Next slide"
          >
            <FaArrowRightLong className="text-white text-xl md:text-2xl transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      )}

      {/* Dots Navigation */}
      {heroSlides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {heroSlides.map((slide, index) => (
            <button
              key={slide.id || slide.src}
              onClick={() => goToSlide(index)}
              className={`h-1.5 transition-all duration-300 cursor-pointer rounded-full ${
                index === currentSlide
                  ? 'w-8 bg-[#004372]' // Active slide - deep-blue color
                  : 'w-3 bg-white/60 hover:bg-white/80' // Inactive slides - light grey with hover
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default Hero
