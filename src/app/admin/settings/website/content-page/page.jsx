'use client'

import ConfirmationModal from '@/components/admin/ConfirmationModal'
import { TanstackTable } from '@/components/admin/TanStackTable'
import {
  deleteContentPage,
  fetchContentPages,
} from '@/features/content-page/contentPageSlice'
import { toast } from '@/utils/toastConfig'
import { createColumnHelper } from '@tanstack/react-table'
import { useRouter } from 'next/navigation'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { FaEdit, FaPlus, FaTrash } from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'

const columnHelper = createColumnHelper()

function ContentPageContent() {
  const dispatch = useDispatch()
  const router = useRouter()

  const [deleteModal, setDeleteModal] = useState({
    open: false,
    contentPage: null,
  })

  const columns = useMemo(
    () => [
      columnHelper.display({
        header: 'ID',
        cell: ({ row }) => row.index + 1,
        enableSorting: false,
      }),
      columnHelper.accessor('pageSlug', {
        header: 'Page Slug',
        enableSorting: true,
      }),
      columnHelper.accessor('pageName', {
        header: 'Page Name',
        enableSorting: true,
      }),
      columnHelper.accessor('status', {
        header: 'Status',
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
                  `/admin/settings/website/content-page/edit/${row.original._id}`,
                )
              }}
              title="Edit Gold"
            >
              <FaEdit className="w-4 h-4" />
            </button>
            <button
              className="p-1.5 text-red-600 hover:bg-red-50 rounded-full hover:text-red-700 transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                setDeleteModal({
                  open: true,
                  contentPage: row.original,
                })
              }}
              title="Delete Gold"
            >
              <FaTrash className="w-4 h-4" />
            </button>
          </div>
        ),
      }),
    ],
    [],
  )

  const { data, isLoading, error } = useSelector(
    (state) => state.contentPage.allContentPages,
  )

  useEffect(() => {
    dispatch(fetchContentPages())
  }, [dispatch])

  const handleConfirmDelete = async () => {
    if (!deleteModal.contentPage) return

    try {
      await dispatch(deleteContentPage(deleteModal.contentPage._id)).unwrap()
      toast.success('Content Page deleted successfully')
      setDeleteModal({ open: false, contentPage: null })
      dispatch(fetchContentPages())
    } catch (err) {
      toast.error(err || 'Failed to delete contentPage')
    }
  }

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">List Of All Content Page</h1>
        <button
          onClick={() =>
            router.push('/admin/settings/website/content-page/add')
          }
          className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
        >
          <FaPlus className="mr-2" /> Add New Content Page
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
        onClose={() => setDeleteModal({ open: false, contentPage: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Content Page"
        description="Are you sure you want to delete this Content Page?"
        confirmText="Delete"
        theme="error"
      />
    </div>
  )
}

export default function ContentPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <ContentPageContent />
    </Suspense>
  )
}
