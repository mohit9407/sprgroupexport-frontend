'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSelector, useDispatch } from 'react-redux'
import { fetchContentPages } from '@/features/content-page/contentPageSlice'

export default function ContentPage() {
  const [pageData, setPageData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug?.join('/') || ''
  const dispatch = useDispatch()

  const { data: contentPages = [] } = useSelector(
    (state) => state.contentPage?.allContentPages || { data: [] },
  )

  useEffect(() => {
    let isMounted = true

    const loadPageData = async () => {
      try {
        setIsLoading(true)
        setNotFound(false)

        // Never redirect to /404 — that path is also caught by this [...slug]
        // route and caused an infinite redirect loop.
        if (contentPages.length === 0) {
          const resultAction = await dispatch(
            fetchContentPages({ status: 'active' }),
          )
          const pages = resultAction.payload?.data || resultAction.payload || []

          const currentPage = pages.find((page) => page.pageSlug === slug)
          if (currentPage) {
            if (isMounted) setPageData(currentPage)
          } else if (isMounted) {
            setNotFound(true)
            setPageData(null)
          }
        } else {
          const currentPage = contentPages.find(
            (page) => page.pageSlug === slug,
          )

          if (currentPage) {
            if (isMounted) setPageData(currentPage)
          } else {
            const resultAction = await dispatch(
              fetchContentPages({ status: 'active' }),
            )
            const pages =
              resultAction.payload?.data || resultAction.payload || []
            const foundPage = pages.find((page) => page.pageSlug === slug)

            if (foundPage) {
              if (isMounted) setPageData(foundPage)
            } else if (isMounted) {
              setNotFound(true)
              setPageData(null)
            }
          }
        }
      } catch (error) {
        console.error('Error loading page:', error)
        if (isMounted) {
          setNotFound(true)
          setPageData(null)
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadPageData()

    return () => {
      isMounted = false
    }
  }, [slug, contentPages, dispatch])

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (notFound || !pageData) {
    return (
      <div className="max-w-4xl mx-auto p-6 min-h-[50vh] flex flex-col items-center justify-center text-center">
        <h1 className="text-6xl font-bold text-[#BA8B4E] mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h2>
        <p className="mb-6 text-gray-600">
          The requested page could not be found.
        </p>
        <button
          type="button"
          onClick={() => router.push('/')}
          className="px-6 py-3 bg-[#BA8B4E] text-white rounded-md hover:bg-[#9A7B3E] transition-colors"
        >
          Return to Home
        </button>
      </div>
    )
  }

  // Check if this is the About Us page
  const isAboutUsPage =
    slug === 'about-us' || pageData?.pageName?.toLowerCase() === 'about us'

  // Use htmlDescription if available, otherwise fall back to description or a default message
  const pageContent =
    pageData.htmlDescription ||
    pageData.description ||
    '<p>No content available.</p>'

  // Render About Us page with special layout
  if (isAboutUsPage) {
    return (
      <>
        <main className="min-h-[calc(100vh-64px)] pt-20">
          {/* Two-column layout section */}
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left column - Image */}
              <div className="order-2 lg:order-1">
                <div className="rounded-lg overflow-hidden shadow-lg">
                  <img
                    src={pageData.pageImage?.mediumUrl || '/bg3.jpg'}
                    alt="About Us"
                    className="w-full h-auto object-cover"
                    onError={(e) => {
                      e.target.src =
                        'https://via.placeholder.com/600x400?text=About+Us+Image'
                    }}
                  />
                </div>
              </div>

              {/* Right column - Content */}
              <div className="order-1 lg:order-2">
                <h1 className="text-4xl font-bold mb-6 text-gray-900">
                  ABOUT US
                </h1>
                <div
                  className="prose prose-lg max-w-none mb-8 text-gray-700"
                  dangerouslySetInnerHTML={{ __html: pageContent }}
                />
                <button
                  onClick={() => router.push('/shop')}
                  className="bg-[#BA8B4E] hover:bg-[#9A7B3E] text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-200 shadow-md"
                >
                  View Collection
                </button>
              </div>
            </div>
          </div>

          {/* Three sections with light orange border */}
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="border-2 border-[#BA8B4E]/30 rounded-lg p-8 bg-[#BA8B4E]/5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Our Story and Beliefs */}
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-4 text-gray-900">
                    Our Story and Beliefs
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Founded with a passion for traditional craftsmanship, we
                    believe in preserving cultural heritage through authentic
                    jewelry designs. Each piece tells a story of artistry and
                    tradition.
                  </p>
                </div>

                {/* Mission */}
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-4 text-gray-900">
                    Mission
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    To bring exquisite traditional jewelry to modern consumers
                    while supporting skilled artisans and preserving age-old
                    crafting techniques for future generations.
                  </p>
                </div>

                {/* Vision */}
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-4 text-gray-900">
                    Vision
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    To become the global destination for authentic traditional
                    jewelry, connecting cultures through the universal language
                    of beauty and craftsmanship.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Content Sections */}
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Why Choose Us */}
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h3 className="text-2xl font-bold mb-6 text-gray-900">
                  Why Choose Us
                </h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-[#BA8B4E] mr-2">✓</span>
                    Premium quality materials sourced directly
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#BA8B4E] mr-2">✓</span>
                    Authentic traditional craftsmanship
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#BA8B4E] mr-2">✓</span>
                    Ethical and sustainable practices
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#BA8B4E] mr-2">✓</span>
                    Direct from artisans to you
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#BA8B4E] mr-2">✓</span>
                    Global shipping with care
                  </li>
                </ul>
              </div>

              {/* Our Values */}
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h3 className="text-2xl font-bold mb-6 text-gray-900">
                  Our Values
                </h3>
                <div className="space-y-4 text-gray-700">
                  <div>
                    <h4 className="font-semibold text-lg mb-2 text-[#BA8B4E]">
                      Authenticity
                    </h4>
                    <p>
                      Every piece is genuinely crafted using traditional
                      techniques passed down through generations.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2 text-[#BA8B4E]">
                      Quality
                    </h4>
                    <p>
                      We never compromise on materials or craftsmanship,
                      ensuring each piece meets our high standards.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2 text-[#BA8B4E]">
                      Sustainability
                    </h4>
                    <p>
                      Supporting artisans and promoting environmentally
                      responsible practices in all we do.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2 text-[#BA8B4E]">
                      Heritage
                    </h4>
                    <p>
                      Preserving cultural traditions while bringing them to
                      contemporary audiences worldwide.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="bg-gray-100 py-16 px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h3 className="text-3xl font-bold mb-8 text-gray-900">
                Get In Touch
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="text-4xl mb-4">📧</div>
                  <h4 className="font-semibold text-lg mb-2 text-gray-900">
                    Email
                  </h4>
                  <p className="text-gray-700">sprgroup100@gmail.com</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="text-4xl mb-4">📞</div>
                  <h4 className="font-semibold text-lg mb-2 text-gray-900">
                    Phone
                  </h4>
                  <p className="text-gray-700">+91 98989 91005</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="text-4xl mb-4">📍</div>
                  <h4 className="font-semibold text-lg mb-2 text-gray-900">
                    Location
                  </h4>
                  <p className="text-gray-700">India</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <main className="min-h-[calc(100vh-64px)] pt-20">
        <div className="max-w-4xl mx-auto p-6">
          <h1 className="text-3xl font-bold mb-6">{pageData.pageName}</h1>
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: pageContent }}
          />
        </div>
      </main>
    </>
  )
}
