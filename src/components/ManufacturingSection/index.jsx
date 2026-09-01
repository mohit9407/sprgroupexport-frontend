'use client'

import { useState } from 'react'

const processTabs = [
  {
    id: 'design',
    label: 'Design Process',
    intro:
      'Our design process begins with inspiration and ends with timeless elegance. We blend creative vision with technical precision, using detailed sketches and 3D modeling to bring each concept to life. Every design is carefully refined to ensure perfect proportions, comfort, and aesthetic harmony.',
    steps: [
      {
        title: 'Concept Development',
        description:
          'We transform creative ideas into refined design concepts through detailed sketches and digital modeling.',
      },
      {
        title: '3D Design & Prototyping',
        description:
          'Each piece is developed using advanced 3D technology to ensure accuracy, balance, and flawless detailing.',
      },
      {
        title: 'Stone Selection & Design Finalization',
        description:
          'We carefully select diamonds and gemstones that best complement each design before final approval.',
      },
    ],
    image: '/design-process.jpg',
  },
  {
    id: 'manufacturing',
    label: 'Manufacturing Process',
    intro:
      'Our manufacturing process combines traditional craftsmanship with modern technology. From casting to stone setting, every stage is executed by skilled artisans to ensure durability, consistency, and exceptional quality.',
    steps: [
      {
        title: 'Precision Casting',
        description:
          'We use advanced casting techniques to achieve perfect structural integrity and detailing.',
      },
      {
        title: 'Expert Stone Setting',
        description:
          'Diamonds and gemstones are meticulously set by experienced craftsmen for maximum brilliance.',
      },
      {
        title: 'Polishing & Finishing',
        description:
          'Each piece undergoes fine polishing and finishing to achieve a flawless, luxurious shine.',
      },
    ],
    image: '/manufacturing-process.jpg',
  },
  {
    id: 'quality',
    label: 'Quality Control Process',
    intro:
      'Quality is the foundation of every Shree Pramukhraj Group Of Export. Each piece passes through multiple inspection stages to ensure superior craftsmanship, accurate stone settings, and compliance with international quality standards.',
    steps: [
      {
        title: 'Material Inspection',
        description:
          'We thoroughly inspect all diamonds, gemstones, and metals for authenticity and quality.',
      },
      {
        title: 'Craftsmanship Review',
        description:
          'Every design is checked for structural strength, symmetry, and finishing precision.',
      },
      {
        title: 'Final Quality Certification',
        description:
          'Each piece is certified and approved before delivery to ensure it meets our promise of excellence.',
      },
    ],
    image: '/quality-control.jpg',
  },
]

const ManufacturingSection = () => {
  const [activeTab, setActiveTab] = useState('design')

  const activeProcess =
    processTabs.find((tab) => tab.id === activeTab) || processTabs[0]

  return (
    <section className="w-full py-0">
      <div className="w-full px-4">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="font-bold text-gray-900 tracking-tight md:text-4xl">
            Manufacturing Unit And Craftsmanship
          </h2>
        </div>
      </div>

      <div className="mx-auto max-w-7xl bg-white px-4 py-8 md:px-8 md:py-10">
        <div className="grid gap-3 border-b border-[#c8c6c2] md:grid-cols-3">
          {processTabs.map((tab) => {
            const isActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className="relative pb-4 text-left text-base font-medium text-[#1f2d34] md:text-lg"
              >
                <span
                  className={`block w-full border-b-2 pb-4 text-center text-[15px] font-medium transition-all md:text-[17px] ${
                    isActive
                      ? 'border-[#BA8B4E] text-[#1f2d33]'
                      : 'border-transparent text-[#465761]'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>

        <div className="mt-8 grid items-start gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="pr-0 lg:pr-6">
            <p className="text-lg leading-8 text-[#2b3a40] md:text-[1.05rem]">
              {activeProcess.intro}
            </p>

            <div className="mt-8 space-y-6">
              {activeProcess.steps.map((step) => (
                <div
                  key={step.title}
                  className="border-l-2 border-[#BA8B4E] pl-4"
                >
                  <h3 className="text-[1.05rem] font-semibold text-[#1b2f3a] md:text-[1.3rem]">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-base leading-7 text-[#4d5d65] md:text-[1.02rem]">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            {/* <div className="absolute -right-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-[#c9b28a] bg-[#f5efe6] shadow-sm">
              <span className="h-3.5 w-3.5 rounded-full border-[2px] border-[#1f2d34] bg-white" />
            </div> */}

            <div className="overflow-hidden rounded-xl shadow-[0_18px_35px_rgba(0,0,0,0.08)]">
              <img
                src={activeProcess.image}
                alt={activeProcess.label}
                className="h-[420px] w-full object-cover md:h-[480px]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ManufacturingSection
