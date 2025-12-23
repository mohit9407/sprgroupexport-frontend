import React from 'react'
import {
  FaTruck,
  FaMoneyBillWave,
  FaHeadset,
  FaCreditCard,
} from 'react-icons/fa'

const FeaturesSection = () => {
  const features = [
    {
      icon: <FaTruck className="text-[35px] text-[#b7853f]" />,
      title: 'Free Shipping',
      description: 'On order over $99',
    },
    {
      icon: <FaMoneyBillWave className="text-[35px] text-[#b7853f]" />,
      title: 'Money Return',
      description: '8 Days Money Return',
    },
    {
      icon: <FaHeadset className="text-[35px] text-[#b7853f]" />,
      title: 'Support 24/7',
      description: 'Hotline: (+91 98989 91005)',
    },
    {
      icon: <FaCreditCard className="text-[35px] text-[#b7853f]" />,
      title: 'Safe Payment',
      description: 'Protect online payment',
    },
  ]

  return (
    <div className="bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`flex items-center p-4 bg-white rounded-lg shadow-sm ${
                index < features.length - 1 ? 'lg:border-r border-gray-200' : ''
              }`}
            >
              <div className="mr-4">{feature.icon}</div>
              <div>
                <h3 className="font-semibold text-gray-800">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FeaturesSection
