'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSelector, useDispatch } from 'react-redux'
import { fetchContentPages } from '@/features/content-page/contentPageSlice'

export default function ContentPage() {
  const [pageData, setPageData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
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
        if (contentPages.length === 0) {
          const resultAction = await dispatch(
            fetchContentPages({ status: 'active' }),
          )
          const pages = resultAction.payload?.data || resultAction.payload || []

          const currentPage = pages.find((page) => page.pageSlug === slug)
          if (currentPage) {
            if (isMounted) setPageData(currentPage)
          } else {
            router.push('/404')
          }
        } else {
          // If we already have content pages, find the current page
          const currentPage = contentPages.find(
            (page) => page.pageSlug === slug,
          )

          if (currentPage) {
            if (isMounted) setPageData(currentPage)
          } else {
            // If page not found, try fetching again in case it's a new page
            const resultAction = await dispatch(
              fetchContentPages({ status: 'active' }),
            )
            const pages =
              resultAction.payload?.data || resultAction.payload || []
            const currentPage = pages.find((page) => page.pageSlug === slug)

            if (currentPage) {
              if (isMounted) setPageData(currentPage)
            } else {
              router.push('/404')
            }
          }
        }
      } catch (error) {
        console.error('Error loading page:', error)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadPageData()

    return () => {
      isMounted = false
    }
  }, [slug, contentPages, dispatch, router])

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
        <div className="mt-4 p-4 bg-blue-50 text-blue-800 rounded">
          <p className="font-medium">Debug Info:</p>
          <p>Current Slug: {slug}</p>
          <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
          <p>Content Pages in Store: {contentPages?.length || 0}</p>
        </div>
      </div>
    )
  }

  if (!pageData) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Page Not Found
          </h2>
          <p className="mb-4">The requested page could not be found.</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Return to Home
          </button>
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded">
          <h3 className="font-medium text-lg mb-2">Debug Information:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium">Current URL:</h4>
              <p className="text-sm break-all">
                {typeof window !== 'undefined' ? window.location.href : ''}
              </p>
            </div>
            <div>
              <h4 className="font-medium">Slug:</h4>
              <p className="text-sm">{slug}</p>
            </div>
            <div>
              <h4 className="font-medium">Content Pages in Store:</h4>
              <p className="text-sm">{contentPages?.length || 0} pages</p>
              {contentPages?.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium">Available Pages:</p>
                  <ul className="text-sm list-disc pl-5">
                    {contentPages.map((page, index) => (
                      <li key={index}>
                        {page.pageName} (/{page.pageSlug})
                        {page.pageSlug === slug && ' ← Current Page'}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Use htmlDescription if available, otherwise fall back to description or a default message
  const pageContent =
    pageData.htmlDescription ||
    pageData.description ||
    '<p>No content available.</p>'

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
