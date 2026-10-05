'use client'

import { Suspense, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchSettings } from '@/features/setting/settingSlice'
import { fetchAllCategories } from '@/features/categories/categoriesSlice'
import Header from '@/components/Header'
import Footer from '@/components/Footer/Footer'

export default function UserLayout({ children }) {
  const {
    settings = [],
    status: settingStatus = 'idle',
    error: settingError,
  } = useSelector((state) => state.settings || { settings: [], status: 'idle' })
  const dispatch = useDispatch()
  const {
    data: categories = [],
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useSelector(
    (state) =>
      state.categories?.allCategories || { data: [], isLoading: false },
  )
  const settingsFetchStartedRef = useRef(false)
  const categoriesFetchStartedRef = useRef(false)

  useEffect(() => {
    if (settingStatus === 'idle' && !settingsFetchStartedRef.current) {
      settingsFetchStartedRef.current = true
      dispatch(fetchSettings())
    }
    if (
      categories.length === 0 &&
      !categoriesLoading &&
      !categoriesFetchStartedRef.current
    ) {
      categoriesFetchStartedRef.current = true
      dispatch(fetchAllCategories())
    }
  }, [settingStatus, dispatch, categories.length, categoriesLoading])

  // Show loading state while settings are being fetched
  if (settingStatus === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004372]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header settings={settings[0] || {}} />
      {settingStatus === 'failed' && (
        <p className="px-4 py-3 text-center text-red-600" role="alert">
          {typeof settingError === 'string'
            ? settingError
            : settingError?.message || 'Failed to load settings'}
        </p>
      )}
      {categoriesError && (
        <p className="px-4 py-3 text-center text-red-600" role="alert">
          {typeof categoriesError === 'string'
            ? categoriesError
            : categoriesError?.message || 'Failed to load categories'}
        </p>
      )}
      <main className="grow w-full mx-auto">
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-100">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004372] mx-auto mb-4"></div>
                <p className="text-gray-600">Loading...</p>
              </div>
            </div>
          }
        >
          {children}
        </Suspense>
      </main>
      <Footer settings={settings[0]} />
    </div>
  )
}
