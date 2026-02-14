'use client'

import { Suspense, useEffect, useMemo, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import TanstackTable from '@/components/admin/TanStackTable/TanstackTable'
import { fetchContactMessages } from '@/features/contact/contactSlice'
import { formatDate } from '@/lib/dateUtils'
import { useTableQueryParams } from '@/components/admin/TanStackTable'

function ContactMessagesPageContent() {
  const dispatch = useDispatch()
  const { params } = useTableQueryParams()

  const { messages, loading, error, pagination } = useSelector(
    (state) => state.contact,
  )

  const getMessages = useCallback(() => {
    dispatch(
      fetchContactMessages({
        page: (params?.pageIndex ?? 0) + 1,
        limit: params?.pageSize,
        status: params?.filterBy?.status,
        search: params?.search,
        sortBy: params?.sortBy || 'createdAt',
        sortOrder: params?.direction || 'desc',
      }),
    )
  }, [dispatch, params])

  useEffect(() => {
    getMessages()
  }, [getMessages])

  const columns = useMemo(
    () => [
      {
        header: 'Name',
        accessorKey: 'name',
        cell: ({ row }) => row.original.name || 'N/A',
        enableSorting: true,
      },
      {
        header: 'Email',
        accessorKey: 'email',
        cell: ({ row }) => row.original.email || 'N/A',
        enableSorting: true,
      },
      {
        header: 'Subject',
        accessorKey: 'subject',
        cell: ({ row }) => row.original.subject || 'No Subject',
        enableSorting: true,
      },
      {
        header: 'Date',
        accessorKey: 'createdAt',
        cell: ({ row }) =>
          row.original.createdAt ? formatDate(row.original.createdAt) : 'N/A',
        enableSorting: true,
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ row }) => (
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              row.original.status === 'read'
                ? 'bg-green-100 text-green-800'
                : 'bg-blue-100 text-blue-800'
            }`}
          >
            {row.original.status || 'unread'}
          </span>
        ),
        enableSorting: true,
      },
    ],
    [],
  )

  const filterByOptions = [
    { label: 'Name', value: 'name', type: 'text' },
    { label: 'Email', value: 'email', type: 'text' },
  ]

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Contact Messages</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <TanstackTable
          columns={columns}
          data={messages || []}
          isLoading={loading}
          filterByOptions={filterByOptions}
          mode="server"
          pageCount={pagination?.totalPages || 1}
          totalItems={pagination?.totalItems || 0}
        />
      </div>
    </div>
  )
}
export default function ContactMessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-64 bg-gray-100 rounded-lg"></div>
          </div>
        </div>
      }
    >
      <ContactMessagesPageContent />
    </Suspense>
  )
}
