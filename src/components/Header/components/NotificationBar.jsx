'use client'

import { FaTimes } from 'react-icons/fa'
import Link from 'next/link'

const NotificationBar = ({ showNotification, onClose }) => {
  if (!showNotification) return null

  return (
    <div className="text-[#333] py-[13px] px-4 bg-white relative z-1">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center justify-center flex-1">
          <span className="text-xl">
            Get <b>UPTO 5% OFF</b> on your 1st order
          </span>
          <Link href="#" className="ml-2 underline text-xl font-bold">
            More details
          </Link>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 ml-4 cursor-pointer"
          aria-label="Close notification"
        >
          <FaTimes className="text-lg" />
        </button>
      </div>
    </div>
  )
}

export default NotificationBar
