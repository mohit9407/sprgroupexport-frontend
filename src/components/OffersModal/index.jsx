'use client'

import { useState, useEffect } from 'react'
import { FaTimes, FaCheck } from 'react-icons/fa'

const OffersModal = ({ isOpen, onClose, offers }) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    let timer
    if (isOpen) {
      // Small delay for the animation
      timer = setTimeout(() => {
        setIsVisible(true)
      }, 10)
    } else {
      timer = setTimeout(() => {
        setIsVisible(false)
      }, 10)
    }
    return () => clearTimeout(timer)
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4 text-center">
        {/* Background overlay with blur */}
        <div
          className={`fixed inset-0 transition-all duration-300 ${isVisible ? 'backdrop-blur-sm' : 'backdrop-blur-none'}`}
          onClick={onClose}
          style={{
            backgroundColor: isVisible
              ? 'rgba(0, 0, 0, 0.1)'
              : 'rgba(0, 0, 0, 0)',
          }}
        />

        {/* Modal panel */}
        <div
          className={`inline-block w-full max-w-lg px-4 pt-5 pb-4 overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-xl ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{
            position: 'relative',
            margin: '0 auto',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                ALL OFFERS ({offers.length})
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto pr-2">
              <ul className="space-y-4">
                {offers.map((offer, index) => (
                  <li
                    key={index}
                    className="border-b border-gray-200 pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <FaCheck className="text-green-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-800">
                          {offer.description}
                        </p>
                        {offer.code && (
                          <div className="mt-1">
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {offer.code}
                            </span>
                          </div>
                        )}
                        {offer.validity && (
                          <p className="text-xs text-gray-500 mt-1">
                            Valid till: {offer.validity}
                          </p>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OffersModal
