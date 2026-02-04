'use client'

import { forwardRef, useState, useMemo } from 'react'
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
      multiSelect = false,
      selectedItems = [],
    },
    ref,
  ) => {
    const [showModal, setShowModal] = useState(false)

    const handleImageSelect = (selected) => {
      if (onImageSelect) {
        onImageSelect(selected)
      }
      setShowModal(false)
    }

    return (
      <div className={`mb-4 ${className}`}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        {!multiSelect ? (
          selectedItem?.thumbnailUrl && (
            <div className="mb-2">
              <img
                src={selectedItem.thumbnailUrl}
                alt="Selected Image"
                className="h-16 w-16 object-cover rounded border"
              />
            </div>
          )
        ) : (
          <div className="mb-2 flex flex-wrap gap-2">
            {selectedItems?.map((item, index) => (
              <div key={item._id || index} className="relative">
                <img
                  src={item.thumbnailUrl}
                  alt={`Selected ${index + 1}`}
                  className="h-16 w-16 object-cover rounded border"
                />
                <span className="absolute -top-2 -right-2 bg-cyan-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {index + 1}
                </span>
              </div>
            ))}
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
            {value || (multiSelect && selectedItems?.length > 0) 
            ? `Change ${label}` 
            : label}
          {multiSelect && selectedItems?.length > 0 && (
            <span className="ml-1 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
              {selectedItems.length} selected
            </span>
          )}
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
          multiSelect={multiSelect}
          selectedImages={multiSelect ? selectedItems : []}
        />
      </div>
    )
  },
)

FileUploadButton.displayName = 'FileUploadButton'

export default FileUploadButton
