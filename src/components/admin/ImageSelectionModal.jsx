'use client'

import { useState, useEffect } from 'react'
import ButtonLoader from './ButtonLoader'
import Modal from './Modal'
import api from '@/lib/axios'
import Image from 'next/image'
import dynamic from 'next/dynamic'

export default function ImageSelectionModal({
  open,
  onClose,
  onSelect,
  title = 'Select Image',
  multiSelect = false,
  selectedImages: externalSelectedImages = [],
}) {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedImages, setSelectedImages] = useState([])
  const [selectedImage, setSelectedImage] = useState(null)
  const [showMediaUpload, setShowMediaUpload] = useState(false)

  useEffect(() => {
    if (open) {
      fetchImages()
    }
  }, [open])

  const fetchImages = async () => {
    setLoading(true)
    try {
      const response = await api.get('/media/get-all')
      setImages(response?.data || [])
    } catch (error) {
      console.error('Error fetching images:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = () => {
    if (multiSelect) {
      onSelect(selectedImages)
    } else if (selectedImage) {
      onSelect(selectedImage)
    }
    onClose()
    setSelectedImages([])
    setSelectedImage(null)
  }

  const footer = (
    <div className="flex justify-between items-center">
      <button
        onClick={() => setShowMediaUpload(true)}
        className="px-4 py-2 rounded border border-cyan-500 text-cyan-600 hover:bg-cyan-50"
      >
        Upload Media
      </button>
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded border text-gray-700 hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          onClick={handleSelect}
          disabled={multiSelect ? selectedImages.length === 0 : !selectedImage}
          className="px-4 py-2 rounded text-white bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {multiSelect ? 'Select Images' : 'Select Image'}
        </button>
      </div>
    </div>
  )

  // Dynamically import AdminAddImageModal to avoid SSR issues
  const MediaUploadModal = dynamic(
    () => import('@/components/AdminAddImageModal'),
    { ssr: false },
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
            {images.map((image) => {
              const isSelected = multiSelect
                ? selectedImages.some((img) => img._id === image._id)
                : selectedImage?._id === image._id

              return (
                <div
                  key={image._id}
                  className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                    isSelected
                      ? 'border-cyan-500 ring-2 ring-cyan-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => {
                    if (multiSelect) {
                      setSelectedImages((prev) => {
                        const exists = prev.some((img) => img._id === image._id)
                        return exists
                          ? prev.filter((img) => img._id !== image._id)
                          : [...prev, image]
                      })
                    } else {
                      setSelectedImage(image)
                    }
                  }}
                >
                  {image.type === 'video' ? (
                    <>
                      <video
                        src={image.videoUrl}
                        poster={image.thumbnailUrl}
                        className="max-h-28 object-contain w-full"
                        style={{ maxWidth: '100%' }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="bg-black/50 rounded-full p-2">
                          <svg
                            className="w-6 h-6 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                          </svg>
                        </div>
                      </div>
                    </>
                  ) : (
                    <Image
                      src={image.thumbnailUrl || image.largeUrl}
                      alt=""
                      width={200}
                      height={100}
                      className="max-h-28 object-contain"
                    />
                  )}
                  {isSelected && (
                    <div className="absolute inset-0 bg-cyan-500/20 flex items-center justify-center">
                      <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">
                          {multiSelect
                            ? selectedImages.findIndex(
                                (img) => img._id === image._id,
                              ) + 1
                            : '✓'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {!loading && images.length === 0 && (
          <div className="text-center py-8 text-gray-500">No images found</div>
        )}
      </div>

      {showMediaUpload && (
        <MediaUploadModal
          open={showMediaUpload}
          onClose={() => setShowMediaUpload(false)}
          onNewImagesAdd={() => {
            fetchImages()
            setShowMediaUpload(false)
          }}
        />
      )}
    </Modal>
  )
}
