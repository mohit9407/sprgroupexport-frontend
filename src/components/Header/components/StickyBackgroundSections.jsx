'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Banner section with background image scoped to the section.
 * Avoids position:fixed on the viewport (that covered Hero / whole homepage).
 */
export default function StickyBackgroundSections({
  sections = [],
  onButtonClick,
  overlayClass = 'bg-black/10',
  sectionClass = '',
}) {
  const router = useRouter()
  const sectionsArray = useMemo(
    () => (Array.isArray(sections) ? sections : [sections]).filter(Boolean),
    [sections],
  )

  const [bgLoaded, setBgLoaded] = useState(false)
  const [hoveredSection, setHoveredSection] = useState(null)

  const handleButtonClick = (section) => {
    if (onButtonClick) {
      onButtonClick(section)
    }
    if (section.route) {
      router.push(section.route)
    }
  }

  useEffect(() => {
    if (sectionsArray.length === 0) {
      setBgLoaded(true)
      return
    }

    let cancelled = false
    const imagePromises = sectionsArray.map((section) => {
      if (!section?.bg) return Promise.resolve()
      return new Promise((resolve) => {
        const img = new Image()
        img.src = section.bg
        img.onload = () => resolve()
        img.onerror = () => resolve()
      })
    })

    Promise.all(imagePromises).then(() => {
      if (!cancelled) setBgLoaded(true)
    })

    return () => {
      cancelled = true
    }
  }, [sectionsArray])

  if (sectionsArray.length === 0) {
    return null
  }

  return (
    <div className="relative z-0">
      {sectionsArray.map((section) => (
        <section
          key={section.id}
          className={`relative w-full h-[500px] md:h-[600px] flex flex-col items-center justify-center px-4 overflow-hidden ${sectionClass} group`}
          onMouseEnter={() => setHoveredSection(section.id)}
          onMouseLeave={() => setHoveredSection(null)}
        >
          <div
            className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-500 ${
              bgLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backgroundImage: section.bg ? `url(${section.bg})` : undefined,
              backgroundColor: '#E6F0F5',
            }}
            aria-hidden
          />
          <div className={`absolute inset-0 ${overlayClass}`} aria-hidden />

          <div className="relative z-10 text-center text-white w-full max-w-5xl mx-auto">
            {section.title ? (
              <h2 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-tight tracking-tight drop-shadow-md">
                {section.title}
              </h2>
            ) : null}
            {section.description ? (
              <p className="text-xl sm:text-2xl md:text-3xl font-bold mt-3 mb-8 drop-shadow-md">
                {section.description}
              </p>
            ) : null}
            {section.buttonText ? (
              <button
                type="button"
                className={`bg-[#8B5A2B] hover:bg-[#6B4423] text-white font-medium py-3 px-8 rounded-md transition-all duration-300 text-lg transform ${
                  hoveredSection === section.id
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-2 opacity-90 md:opacity-0 md:invisible md:group-hover:opacity-100 md:group-hover:visible md:group-hover:translate-y-0'
                }`}
                onClick={() => handleButtonClick(section)}
              >
                {section.buttonText}
              </button>
            ) : null}
          </div>
        </section>
      ))}
    </div>
  )
}
