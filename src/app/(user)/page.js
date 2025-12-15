'use client'

import StickyBackgroundSections from '@/components/Header/components/StickyBackgroundSections'
import Hero from '@/components/Hero'
import CategorySection from '@/components/CategorySection'
import SectionHeader from '@/components/SectionHeader'
import NewArrivalSection from '@/components/NewArrivalSection'
import FeaturesSection from '@/components/FeaturesSection'

export default function UserDashboard() {
  const handleButtonClick = (section) => {
    console.log(`Navigating to: ${section.title}`)
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero />
      <div className="bg-white h-[100px] relative z-1" />
      <StickyBackgroundSections
        sections={{
          id: 'bridal-collection',
          bg: '/bg1.jpg',
          title: 'Bridal',
          description: 'Jewellery for bride',
          buttonText: 'View All Range',
        }}
        onButtonClick={handleButtonClick}
        overlayClass="bg-black/30"
      />
      <div className="bg-white relative z-1">
        <CategorySection />
      </div>
      <div className="bg-white h-[100px] relative z-1" />
      <StickyBackgroundSections
        sections={{
          id: 'bridal-collection',
          bg: '/bg2.jpg',
          title: 'TRENDING Now',
          description: 'Classic & Trendy',
          buttonText: 'View All Range',
        }}
        onButtonClick={handleButtonClick}
        overlayClass="bg-black/30"
      />
      <div className="bg-white py-12 relative z-1">
        <div className="container mx-auto px-4">
          <SectionHeader
            title="TOP SELLING OF THE WEEK"
            subtitle="TOP SELLING PRODUCTS OF THE WEEK"
          />
        </div>
      </div>

      {/* New Arrival Section */}
      <div className="bg-white relative z-1">
        <NewArrivalSection />
      </div>
      <div className="bg-white h-[100px] relative z-1" />
      <StickyBackgroundSections
        sections={{
          id: 'bridal-collection',
          bg: '/bg3.jpg',
          title: 'BIG SALE',
          description: 'Women Gold ornaments',
          buttonText: 'Shop Now',
        }}
        onButtonClick={handleButtonClick}
        overlayClass="bg-black/30"
      />
      <div className="bg-white relative z-1">
        <FeaturesSection />
      </div>
    </div>
  )
}
