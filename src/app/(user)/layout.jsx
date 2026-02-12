'use client'

import { Suspense, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer/Footer'
import { useDispatch, useSelector } from 'react-redux'
import { fetchSettings } from '@/features/setting/settingSlice'

export default function UserLayout({ children }) {
  const { settings = [], status: settingStatus = 'idle' } = useSelector((state) => state.settings || { settings: [], status: 'idle' });
  const dispatch = useDispatch();
  
  useEffect(() => {
    if (settingStatus === 'idle') {
      dispatch(fetchSettings());
    }
  }, [settingStatus, dispatch]);

  // Show loading state while settings are being fetched
  if (settingStatus === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#BA8B4E]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header settings={settings[0] || {}}/>
      <main className="grow w-full mx-auto">
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#BA8B4E] mx-auto mb-4"></div>
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
