'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import AdminAddImageModal from '@/components/AdminAddImageModal'
import api from '@/lib/axios'

const fetchImages = async () => {
  try {
    const response = await api.get('/media/get-all')
    return response?.data || []
  } catch (e) {
    console.error('Get All Images: ', e)
  }
}

export default function MediaListPage() {
  const [images, setImages] = useState([])
  const [selected, setSelected] = useState([])
  const [openAddImage, setOpenAddImage] = useState(false)

  const loadImages = async () => {
    const imgs = await fetchImages()
    setImages(imgs)
    setSelected([])
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

  const handleDelete = async () => {
    if (!selected.length) {
      alert('Select at least one image')
      return
    }

    if (!confirm('Delete selected images?')) return

    await api.delete('/media/delete-multiple', { ids: selected })
    await loadImages()
  }

  return (
    <div className="space-y-3">
      <div className="lg:flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Listing All The Images</h3>

        <div className="flex gap-2">
          <button
            onClick={handleDelete}
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
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {images.map((img) => (
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
                flex justify-center items-center cursor-pointer rounded p-1 transition h-32`}
            >
              <Image
                src={img.thumbnailUrl}
                alt=""
                width={200}
                height={100}
                className="max-h-28 object-contain"
              />
            </div>

            <a
              href={`/admin/media/detail/${img._id}`}
              className="block py-2 bg-sky-600 text-white text-sm rounded"
            >
              View Detail
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
