'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'

/**
 * StickyBackgroundSections Component
 *
 * @param {Object} props
 * @param {Array} props.sections - Array of section objects
 * @param {string} props.sections[].id - Unique identifier for the section
 * @param {string} props.sections[].bg - Background image URL
 * @param {string} props.sections[].title - Section title
 * @param {string} props.sections[].description - Section description
 * @param {string} [props.sections[].buttonText] - Optional button text
 * @param {Function} [props.onButtonClick] - Optional click handler for the button
 * @param {string} [props.overlayClass] - Optional custom class for the overlay div
 * @param {string} [props.sectionClass] - Optional custom class for each section
 * @returns {JSX.Element}
 */
export default function StickyBackgroundSections({
  sections = [],
  onButtonClick,
  overlayClass = 'bg-black/10',
  sectionClass = '',
}) {
  const router = useRouter()
  // Memoize sections array to prevent unnecessary recalculations
  const sectionsArray = useMemo(
    () => (Array.isArray(sections) ? sections : [sections]),
    [sections],
  )

  // Set initial background from the first section
  const [activeBg, setActiveBg] = useState(() => {
    const firstSection = Array.isArray(sections) ? sections[0] : sections
    return firstSection?.bg || ''
  })
  const [bgLoaded, setBgLoaded] = useState(false)
  const [hoveredSection, setHoveredSection] = useState(null)

  const handleButtonClick = (section) => {
    // Call the provided onClick handler if it exists
    if (onButtonClick) {
      onButtonClick(section)
    }

    // If the section has a route, navigate to it
    if (section.route) {
      router.push(section.route)
    }
  }
  const observerRef = useRef(null)

  // Preload all background images and set up observer
  useEffect(() => {
    if (sectionsArray.length === 0) return

    // Preload all background images
    const imagePromises = sectionsArray.map((section) => {
      if (section?.bg) {
        return new Promise((resolve) => {
          const img = new Image()
          img.src = section.bg
          img.onload = () => resolve()
          img.onerror = () => resolve() // Resolve even if image fails to load
        })
      }
      return Promise.resolve()
    })

    Promise.all(imagePromises).then(() => {
      setBgLoaded(true)
    })

    // Cleanup previous observer if it exists
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    const handleIntersection = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const bg = entry.target.dataset.bg
          if (bg) {
            setActiveBg(bg)
          }
        }
      })
    }

    // Create new observer
    observerRef.current = new IntersectionObserver(handleIntersection, {
      threshold: 0.5,
      rootMargin: '0px',
    })

    // Observe all sections with data-bg attribute
    const sectionElements = document.querySelectorAll('[data-bg]')
    sectionElements.forEach((section) => observerRef.current.observe(section))

    // Cleanup function
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [sectionsArray]) // Removed activeBg from dependencies

  if (sectionsArray.length === 0) {
    return <div>No sections provided</div>
  }

  if (!bgLoaded) {
    return (
      <div className="fixed inset-0 bg-gray-100 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="relative h-[500px]">
      {/* Sticky Background */}
      <div
        className="fixed inset-0 bg-cover bg-center transition-all w-full transform-gpu"
        style={{
          backgroundImage: `url(${activeBg})`,
          backgroundColor: '#E6F0F5',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          height: '100vh',
          width: '100%',
          position: 'fixed',
          top: 0,
          left: 0,
        }}
      >
        <div className={`absolute inset-0 ${overlayClass}`} />
      </div>

      {/* Sections Content */}
      {sectionsArray.map((section) => (
        <section
          key={section.id}
          className={`w-full h-[500px] flex flex-col items-center justify-center relative px-4 ${sectionClass} group`}
          data-bg={section.bg}
          onMouseEnter={() => setHoveredSection(section.id)}
          onMouseLeave={() => setHoveredSection(null)}
        >
          <div className="text-center text-white w-full relative z-1">
            <h2 className="text-7xl md:text-8xl font-bold leading-tight tracking-tight">
              {section.title}
            </h2>
            <div className="relative">
              <p className="text-[40px] md:text-3xl font-bold mt-2 mb-8">
                {section.description}
              </p>
              {section.buttonText && (
                <button
                  className={`absolute left-1/2 -translate-x-1/2 w-auto whitespace-nowrap bg-[#8B5A2B] hover:bg-[#6B4423] text-white font-medium py-3 px-8 rounded-md transition-all duration-300 text-lg mx-auto transform ${
                    hoveredSection === section.id
                      ? 'translate-y-0 opacity-100 visible'
                      : '-translate-y-4 opacity-0 invisible'
                  }`}
                  onClick={() => handleButtonClick(section)}
                >
                  {section.buttonText}
                </button>
              )}
            </div>
          </div>
        </section>
      ))}
    </div>
  )
}
