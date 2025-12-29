import api from '@/lib/axios'
import Image from 'next/image'
import React from 'react'

const getImageDetails = async (id) => {
  try {
    const resp = await api.get(`/media/${id}`)
    return resp.data
  } catch (e) {
    console.error('Get Image Details: ', e)
  }
}

const page = async ({ params }) => {
  const { _id } = await params
  const image = await getImageDetails(_id)

  if (!image) {
    return
  }

  return (
    <div className="space-y-3">
      <h2 className="text-2xl font-semibold">{`ACTUAL (${image.originalHeight} X ${image.originalWidth})`}</h2>
      <div className="p-1 mb-4 border-2 border-gray-300 rounded-md grid place-items-center">
        <Image
          src={image.originalUrl}
          alt=""
          width={image.originalWidth}
          height={image.originalHeight}
          className="object-contain"
        />
      </div>

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
              value={image.originalUrl}
              className="flex-1 px-3 py-2 text-sm outline-none bg-white"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default page
