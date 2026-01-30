'use client'

import { forwardRef, useState } from 'react'
import ImageSelectionModal from '../ImageSelectionModal'

const FileUploadButton = forwardRef(
  (
    {
      id,
      label,
      onChange,
      value,
      error,
      accept = 'image/*',
      className = '',
      onImageSelect,
      selectedItem = {},
    },
    ref,
  ) => {
    const [showModal, setShowModal] = useState(false)

    const handleImageSelect = (imageId) => {
      if (onImageSelect) {
        onImageSelect(imageId)
      }
      setShowModal(false)
    }

    return (
      <div className={`mb-4 ${className}`}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        {selectedItem?.thumbnailUrl && (
          <div className="mb-2">
            <img
              src={selectedItem.thumbnailUrl}
              alt="Selected Image"
              className="h-16 w-16 object-cover rounded border"
            />
          </div>
        )}
        <div className="mt-1 flex items-center gap-2">
          <input
            type="file"
            accept={accept}
            onChange={onChange}
            className="hidden"
            id={id}
            ref={ref}
          />

          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
          >
            {value ? 'Change ' + label : label}
          </button>

          {value && (
            <span className="ml-2 text-sm text-gray-500">
              {typeof value === 'object' ? value.name : value}
            </span>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error.message}</p>}

        <ImageSelectionModal
          open={showModal}
          onClose={() => setShowModal(false)}
          onSelect={handleImageSelect}
          title={`Select ${label}`}
        />
      </div>
    )
  },
)

FileUploadButton.displayName = 'FileUploadButton'

export default FileUploadButton
