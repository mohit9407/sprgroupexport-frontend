'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import AdminAddImageModal from '@/components/AdminAddImageModal'
import api from '@/lib/axios'
import toast from 'react-hot-toast'
import ConfirmationModal from '@/components/admin/ConfirmationModal'

const fetchImages = async () => {
  try {
    const response = await api.get('/media/get-all')
    return response?.data || []
  } catch (e) {
    console.error('Get All Images error: ', e)
    return []
  }
}

const formatSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B'
  const gb = bytes / (1024 * 1024 * 1024)
  const mb = bytes / (1024 * 1024)
  if (gb >= 1) return `${gb.toFixed(2)} GB`
  if (mb >= 1) return `${mb.toFixed(2)} MB`
  return `${(bytes / 1024).toFixed(2)} KB`
}

export default function MediaListPage() {
  const [images, setImages] = useState([])
  const [selected, setSelected] = useState([])
  const [openAddImage, setOpenAddImage] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadImages = async () => {
    setLoading(true)
    const imgs = await fetchImages()
    setImages(imgs)
    setSelected([])
    setLoading(false)
  }

  useEffect(() => {
    ;(async () => {
      await loadImages()
    })()
  }, [])

  const isSelected = (id) => selected.includes(id)

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    )
  }

  const selectAll = () => setSelected(images.map((i) => i._id))
  const unselectAll = () => setSelected([])

  const deleteImages = async () => {
    if (!selected.length) {
      alert('Select at least one image')
      return
    }
    setOpenDelete(true)
  }

  const handleDelete = async () => {
    try {
      await api.delete('/media/delete-multiple', {
        data: {
          ids: selected,
        },
      })
      toast.success('Successfully deleted images.')
    } catch (e) {
      console.error('Delete Images error: ', e)
      toast.error('Unable to delete images please try again.')
    } finally {
      await loadImages()
      setOpenDelete(true)
    }
  }

  return (
    <div className="space-y-3">
      <div className="lg:flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Listing All The Images</h3>

        <div className="flex gap-2">
          <button
            onClick={deleteImages}
            className="px-4 py-2 bg-red-600 text-white rounded font-semibold"
          >
            Delete
          </button>

          <button
            onClick={selectAll}
            className="px-4 py-2 bg-green-600 text-white rounded font-semibold"
          >
            Select All
          </button>

          <button
            onClick={unselectAll}
            className="px-4 py-2 bg-sky-500 text-white rounded font-semibold"
          >
            UnSelect All
          </button>

          <button
            onClick={() => setOpenAddImage(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded font-semibold"
          >
            Add New
          </button>
        </div>
        <AdminAddImageModal
          open={openAddImage}
          onClose={() => setOpenAddImage(false)}
          onNewImagesAdd={loadImages}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {loading ? (
          <div className="col-span-full flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : images.length === 0 ? (
          <div className="col-span-full text-center py-10 text-gray-500">
            No media found. Upload some images or videos.
          </div>
        ) : (
          images.map((img) => {
            const isVideo = img.type === 'video'
            const original = img.sizes?.original
            const compressed = img.sizes?.compressed

            return (
              <div
                key={img._id}
                className={`text-center ${
                  isSelected(img._id)
                    ? 'border-2 border-blue-600 opacity-80'
                    : 'border border-gray-200 hover:border-2 hover:border-gray-400'
                }`}
              >
                <div
                  onClick={() => toggleSelect(img._id)}
                  className={`
                    flex justify-center items-center cursor-pointer rounded p-1 transition h-32 relative`}
                >
                  {isVideo ? (
                    <>
                      <video
                        src={img.videoUrl}
                        className="max-h-28 object-contain"
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
                      src={img.thumbnailUrl || img.largeUrl}
                      alt=""
                      width={200}
                      height={100}
                      className="max-h-28 object-contain"
                    />
                  )}
                </div>

                <a
                  href={`/admin/media/detail/${img._id}`}
                  className="block py-2 bg-sky-600 text-white text-sm rounded"
                >
                  View Detail
                </a>
              </div>
            )
          })
        )}
      </div>
      <ConfirmationModal
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        onConfirm={handleDelete}
        title="Delete Media"
        description="Are you sure you want to delete this media?"
        confirmText="Delete"
        theme="error"
      />
    </div>
  )
}
