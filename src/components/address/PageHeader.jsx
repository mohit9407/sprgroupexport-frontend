'use client'

import Link from 'next/link'
import { FaArrowLeft } from 'react-icons/fa'

export default function PageHeader({ title, subtitle }) {
  return (
    <div className="mb-6">
      <Link
        href="/"
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <FaArrowLeft className="mr-2" />
        <span>Back to Home</span>
      </Link>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
          <p className="text-gray-500 text-sm">{subtitle}</p>
        </div>
      </div>
    </div>
  )
}
