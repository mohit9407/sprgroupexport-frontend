'use client'

import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { toast } from '@/utils/toastConfig'
import { getContentPageById } from '@/features/content-page/contentPageSlice'
import ContentForm from '@/components/admin/ContentPageForm/ContentForm'

export default function EditContentPage({ params }) {
  const { id } = params
  const dispatch = useDispatch()
  const router = useRouter()

  // Get the page data from the Redux store
  const {
    data: currentPage,
    isLoading: loading,
    error,
  } = useSelector((state) => ({
    data: state.contentPage.getContentPageById.data,
    isLoading: state.contentPage.getContentPageById.isLoading,
    error: state.contentPage.getContentPageById.error,
  }))

  // Fetch the page data when the component mounts
  useEffect(() => {
    const fetchPage = async () => {
      try {
        await dispatch(getContentPageById(id)).unwrap()
      } catch (error) {
        console.error('Error fetching page:', error)
        toast.error('Failed to load page data')
        router.push('/admin/settings/website/content-page')
      }
    }

    if (id) {
      fetchPage()
    }
  }, [id, dispatch, router])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              {error.message || 'Failed to load page data. Please try again.'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {currentPage && (
        <ContentForm
          mode="edit"
          title="Edit Page"
          id={id}
          defaultValues={{
            pageSlug: currentPage.pageSlug,
            pageName: currentPage.pageName,
            description: currentPage.description,
            status: currentPage.status,
          }}
        />
      )}
    </div>
  )
}
