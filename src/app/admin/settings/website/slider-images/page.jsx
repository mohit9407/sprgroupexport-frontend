'use client'

import ConfirmationModal from '@/components/admin/ConfirmationModal'
import { TanstackTable } from '@/components/admin/TanStackTable'
import {
  deleteSliderImages,
  fetchSliderImages,
} from '@/features/slider-images/sliderImagesSlice'
import { toast } from '@/utils/toastConfig'
import { createColumnHelper } from '@tanstack/react-table'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { FaEdit, FaPlus, FaTrash } from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'

const columnHelper = createColumnHelper()

function SlideImageTableContent() {
  const dispatch = useDispatch()
  const router = useRouter()

  const [deleteModal, setDeleteModal] = useState({
    open: false,
    slider: null,
  })

  const { data, isLoading, error } = useSelector(
    (state) => state.slider.allSliderImages,
  )

  const getSliderImages = useCallback(() => {
    dispatch(fetchSliderImages())
  }, [dispatch])

  useEffect(() => {
    getSliderImages({
      page: 1,
      limit: 10,
    })
  }, [getSliderImages])

  const handleDeleteClick = (slider) => {
    setDeleteModal({ open: true, slider })
  }
  const handleConfirmDelete = async () => {
    if (!deleteModal.slider) return

    try {
      await dispatch(deleteSliderImages(deleteModal.slider._id)).unwrap()

      toast.success('Slider Image deleted successfully')
      setDeleteModal({ open: false, slider: null })
      getSliderImages()
    } catch (err) {
      toast.error(err || 'Failed to delete Image')
    }
  }

  const columns = useMemo(
    () => [
      columnHelper.display({
        header: 'ID',
        cell: (row) => row.row.index + 1,
      }),
      columnHelper.accessor('sliderType', {
        header: 'Slider Type',
        enableSorting: false,
      }),
      {
        accessorKey: 'sliderImage',
        header: 'Slider Image',
        enableSorting: false,
        cell: ({ row }) => {
          const imageUrl = row.original.sliderImage

          return (
            <div className="w-16 h-16 relative bg-gray-100 flex items-center justify-center rounded">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt="sliderImage"
                  fill
                  className="object-cover rounded"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <span className="text-gray-400 text-xs">No image</span>
              )}
            </div>
          )
        },
        size: 100,
      },
      columnHelper.accessor('expiryDate', {
        header: 'Added/Modified Date',
        enableSorting: false,
        cell: (info) => {
          const row = info.row.original
          return (
            <div className="text-sm">
              <div className="font-medium">
                Added:{' '}
                {new Date(row.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </div>
              <div className="text-gray-500">
                Modified:{' '}
                {row.updatedAt
                  ? new Date(row.updatedAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'N/A'}
              </div>
              <div className="text-gray-500">
                Expiry:{' '}
                {new Date(row.expiryDate).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </div>
            </div>
          )
        },
      }),
      columnHelper.accessor('language', {
        header: 'Language',
        enableSorting: false,
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2 justify-center">
            <button
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full hover:text-blue-700 transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                router.push(
                  `/admin/settings/website/slider-images/edit/${row.original._id}`,
                )
              }}
            >
              <FaEdit className="w-4 h-4" />
            </button>
            <button
              className="p-1.5 text-red-600 hover:bg-red-50 rounded-full hover:text-red-700 transition-colors"
              onClick={(e) => {
                handleDeleteClick(row.original)
              }}
            >
              <FaTrash className="w-4 h-4" />
            </button>
          </div>
        ),
      }),
    ],
    [],
  )

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold mb-4">List of Slider Images</h2>

        <button
          className="bg-sky-600 text-white px-4 py-2 rounded text-sm hover:bg-sky-700 transition-colors flex items-center gap-2"
          onClick={() =>
            router.push('/admin/settings/website/slider-images/add')
          }
        >
          <FaPlus /> Add Slider Image
        </button>
      </div>

      <TanstackTable
        columns={columns}
        data={data || []}
        isLoading={isLoading}
        mode="server"
      />

      <ConfirmationModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, slider: null })}
        onConfirm={handleConfirmDelete}
        title="Delete slider Image"
        description="Are you sure you want to delete this slider Image?"
        confirmText="Delete"
        theme="error"
      />
    </div>
  )
}

export default function SliderImagePage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <SlideImageTableContent />
    </Suspense>
  )
}
