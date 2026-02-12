'use client'

import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import StickyBackgroundSections from '@/components/Header/components/StickyBackgroundSections'
import Hero from '@/components/Hero'
import CategorySection from '@/components/CategorySection'
import SectionHeader from '@/components/SectionHeader'
import NewArrivalSection from '@/components/NewArrivalSection'
import FeaturesSection from '@/components/FeaturesSection'
import { fetchParallaxBanners } from '@/features/parallax-banner/parallaxBannerSlice'
import { getGeneralSetting } from '@/features/general-setting/generatSettingSlice'

export default function UserDashboard() {
  const dispatch = useDispatch()

  const { banners = [], status: bannerStatus } = useSelector((state) => state.parallaxBanner)
  const { data: generalSettings, status: generalSettingsStatus } = useSelector((state) => state.generalSetting)

  useEffect(() => {
    if (bannerStatus === 'idle') {
      dispatch(fetchParallaxBanners())
    }
    if (generalSettingsStatus === 'idle') {
      dispatch(getGeneralSetting())
    }
  }, [bannerStatus, generalSettingsStatus, dispatch])
  const handleButtonClick = (section) => {
    console.log(`Navigating to: ${section.title}`)
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero />
      <div className="bg-white h-25 relative z-1" />
      {banners?.[0] && (
        <StickyBackgroundSections
          sections={{
            id: banners[0]._id,
            bg: banners[0].banner,
            title: banners[0].title,
            description: banners[0].description,
            buttonText: 'View All Range',
            route: '/shop',
          }}
          onButtonClick={handleButtonClick}
          overlayClass="bg-black/30"
        />
      )}
      <div className="bg-white relative z-1">
        <CategorySection title={generalSettings?.productCategorySectionText} />
      </div>
      <div className="bg-white h-25 relative z-1" />
      {banners?.[1] && (
        <StickyBackgroundSections
          sections={{
            id: banners[1]._id,
            bg: banners[1].banner,
            title: banners[1].title,
            description: banners[1].description,
            buttonText: 'View All Range',
            route: '/shop',
          }}
          onButtonClick={handleButtonClick}
          overlayClass="bg-black/30"
        />
      )}
      <div className="bg-white py-12 relative z-1">
        <div className="container mx-auto px-4">
          <SectionHeader
            title={generalSettings?.topSellingSectionText}
            subtitle="TOP SELLING PRODUCTS OF THE WEEK"
          />
        </div>
      </div>

      {/* New Arrival Section */}
      <div className="bg-white relative z-1">
        <NewArrivalSection title={generalSettings?.newArrivalSectionText} />
      </div>
      <div className="bg-white h-25 relative z-1" />
      {banners?.[2] && (
        <StickyBackgroundSections
          sections={{
            id: banners[2]._id,
            bg: banners[2].banner,
            title: banners[2].title,
            description: banners[2].description,
            buttonText: 'Shop Now',
            route: '/shop',
          }}
          onButtonClick={handleButtonClick}
          overlayClass="bg-black/30"
        />
      )}
      <div className="bg-white relative z-1">
        <FeaturesSection />
      </div>
    </div>
  )
}
