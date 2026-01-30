'use client'

import { useState, useEffect } from 'react'
import ButtonLoader from './ButtonLoader'
import Modal from './Modal'
import api from '@/lib/axios'
import Image from 'next/image'

export default function ImageSelectionModal({
  open,
  onClose,
  onSelect,
  title = 'Select Image',
}) {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)

  useEffect(() => {
    if (open) {
      fetchImages()
    }
  }, [open])

  const fetchImages = async () => {
    setLoading(true)
    try {
      const response = await api.get('/media/get-all')
      setImages(response.data || [])
    } catch (error) {
      console.error('Error fetching images:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = () => {
    if (selectedImage) {
      onSelect(selectedImage)
      onClose()
      setSelectedImage(null)
    }
  }

  const footer = (
    <div className="flex justify-end gap-3">
      <button
        onClick={onClose}
        className="px-4 py-2 rounded border text-gray-700 hover:bg-gray-100"
      >
        Cancel
      </button>
      <button
        onClick={handleSelect}
        disabled={!selectedImage}
        className="px-4 py-2 rounded text-white bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Select Image
      </button>
    </div>
  )

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="lg"
      footer={footer}
    >
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <ButtonLoader className="text-gray-600" />
            <span className="ml-2">Loading images...</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((image) => (
              <div
                key={image._id}
                className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                  selectedImage?._id === image._id
                    ? 'border-cyan-500 ring-2 ring-cyan-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedImage(image)}
              >
                <Image
                  src={image.thumbnailUrl}
                  alt=""
                  width={200}
                  height={100}
                  className="max-h-28 object-contain"
                />
                {selectedImage?._id === image._id && (
                  <div className="absolute inset-0 bg-cyan-500/20 flex items-center justify-center">
                    <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">✓</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!loading && images.length === 0 && (
          <div className="text-center py-8 text-gray-500">No images found</div>
        )}
      </div>
    </Modal>
  )
}
