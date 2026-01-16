'use client'

import { forwardRef } from 'react'

const FileUploadButton = forwardRef(
  (
    { id, label, onChange, value, error, accept = 'image/*', className = '' },
    ref,
  ) => {
    return (
      <div className={`mb-4 ${className}`}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        <div className="mt-1 flex items-center">
          <input
            type="file"
            accept={accept}
            onChange={onChange}
            className="hidden"
            id={id}
            ref={ref}
          />
          <label
            htmlFor={id}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 cursor-pointer"
          >
            {value ? 'Change ' + label : 'Add ' + label}
          </label>
          {value && (
            <span className="ml-2 text-sm text-gray-500">
              {typeof value === 'object' ? value.name : value}
            </span>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error.message}</p>}
      </div>
    )
  },
)

FileUploadButton.displayName = 'FileUploadButton'

export default FileUploadButton
