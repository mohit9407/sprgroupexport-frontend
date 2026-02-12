import api from '@/lib/axios'
import Image from 'next/image'
import React from 'react'

const getImageDetails = async (id) => {
  try {
    const resp = await api.get(`/media/${id}`)
    return resp?.data
  } catch (e) {
    console.error('Get Image Details: ', e)
  }
}

const formatSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B'
  const gb = bytes / (1024 * 1024 * 1024)
  const mb = bytes / (1024 * 1024)
  const kb = bytes / 1024

  if (gb >= 1) return `${gb.toFixed(2)} GB`
  if (mb >= 1) return `${mb.toFixed(2)} MB`
  if (kb >= 1) return `${kb.toFixed(2)} KB`
  return `${bytes} B`
}

const formatDuration = (seconds) => {
  if (!seconds || seconds === 0) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const page = async ({ params }) => {
  const { _id } = await params
  const image = await getImageDetails(_id)

  if (!image) {
    return (
      <div className="p-10 text-center">
        <p className="text-lg text-red-600">Media not found</p>
        <a href="/admin/media" className="text-blue-600 underline mt-4 block">
          Back to Media List
        </a>
      </div>
    )
  }

  const isVideo = image.type === 'video'
  const original = image.sizes?.original
  const compressed = image.sizes?.compressed

  return (
    <div className="space-y-3">
      {isVideo ? (
        <>
          <h2 className="text-2xl font-semibold">Video Details</h2>

          {/* Video Player */}
          <div className="p-1 mb-4 border-2 border-gray-300 rounded-md">
            <video
              src={image.videoUrl}
              controls
              className="w-full max-h-[500px]"
              style={{ maxWidth: '100%' }}
              autoPlay
            />
          </div>

          {/* Compression Ratio */}
          {original?.size && compressed?.size && (
            <div className="bg-gray-100 p-3 rounded-lg mb-4 text-center">
              <p className="text-sm text-gray-700">
                Compression saved:{' '}
                <span className="font-semibold text-green-600">
                  {formatSize(original.size - compressed.size)}(
                  {((1 - compressed.size / original.size) * 100).toFixed(1)}%
                  reduction)
                </span>
              </p>
            </div>
          )}
        </>
      ) : (
        <>
          <h2 className="text-2xl font-semibold">{`ACTUAL (${image.largeHeight} X ${image.largeWidth})`}</h2>
          <div className="p-1 mb-4 border-2 border-gray-300 rounded-md grid place-items-center">
            <Image
              src={image.largeUrl}
              alt=""
              width={image.largeWidth}
              height={image.largeHeight}
              className="object-contain"
            />
          </div>
        </>
      )}

      <div className="flex justify-center">
        <div className="w-full max-w-xl">
          <div className="flex rounded border overflow-hidden">
            <span className="bg-gray-100 px-3 flex items-center text-sm font-medium border-r">
              Path
            </span>

            <input
              type="text"
              name="path"
              readOnly
              value={isVideo ? image.videoUrl : image.largeUrl}
              className="flex-1 px-3 py-2 text-sm outline-none bg-white"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default page
