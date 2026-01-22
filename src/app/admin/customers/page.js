'use client'

import { useEffect, useMemo, useState, Suspense } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import { RowActionsMenu } from '@/components/admin/RowActionMenu'
import { getAddressString } from '@/utils/stringUtils'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { getAllCustomers } from '@/features/customers/customersSlice'
import ConfirmationModal from '@/components/admin/ConfirmationModal'
import toast from 'react-hot-toast'
import {
  TanstackTable,
  useTableQueryParams,
} from '@/components/admin/TanStackTable'

const columnHelper = createColumnHelper()

const getColumns = (onDelete) => [
  columnHelper.accessor('id', {
    header: 'ID',
    cell: (info) => info.getValue(),
    enableSorting: true,
  }),
  columnHelper.accessor('name', {
    header: 'Full Name',
    enableSorting: true,
  }),
  columnHelper.accessor('email', {
    header: 'Email',
    enableSorting: true,
  }),
  columnHelper.accessor('phone', {
    header: 'Additional Info',
    enableSorting: false,
    cell: (info) => (
      <span className="text-sm">
        <strong>Phone:</strong> {info.getValue()}
      </span>
    ),
  }),
  columnHelper.accessor('address', {
    id: 'shippingAddress',
    header: 'Address',
    enableSorting: true,
  }),
  columnHelper.display({
    id: 'action',
    header: 'Action',
    enableSorting: false,
    cell: ({ row }) => {
      const id = row.original.id

      return (
        <RowActionsMenu
          items={[
            {
              label: 'Edit Customer',
              href: `/admin/customers/edit/${id}`,
            },
            {
              label: 'Edit Address',
              href: `/admin/customers/address/${id}`,
            },
            {
              label: 'Delete',
              danger: true,
              onClick: () => onDelete(id),
            },
          ]}
        />
      )
    },
  }),
]

// This component is wrapped in Suspense to handle search params
function CustomersPageContent() {
  const router = useRouter()
  const dispatch = useDispatch()
  const { params } = useTableQueryParams()
  const [deleteModal, setDeleteModal] = useState({ open: false })
  const {
    data,
    pagination: apiPagination,
    isLoading,
  } = useSelector((state) => state.customers.allCustomers)

  const columns = useMemo(
    () => getColumns((id) => setDeleteModal({ open: true, id })),
    [],
  )

  const getCustomers = async () => {
    try {
      dispatch(
        getAllCustomers({
          search: params?.search ?? undefined,
          sortBy: params?.sortBy,
          sortOrder: params?.sortBy ? params.direction : undefined,
          page: params?.pageIndex + 1,
          limit: params?.pageSize ?? 10,
          filterBy: params?.filterBy || undefined,
        }),
      )
    } catch (error) {
      console.error(error)
    }
  }

  const customers = useMemo(() => {
    return (
      data?.map((u) => {
        const defaultAddress = u.shippingAddress?.find((a) => a.isDefault)

        return {
          id: u._id,
          name: `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim(),
          email: u.email,
          phone: u.mobileNo || '-',
          address: getAddressString(defaultAddress) || '-',
        }
      }) || []
    )
  }, [data])

  const handleDelete = () => {
    dispatch(deleteCustomer({ id: deleteModal.id }))
    setDeleteModal({
      open: false,
    })
    toast.success('Successfully deleted customer')
  }

  const filterByOptions = useMemo(
    () => [
      { label: 'Name', value: 'name' },
      { label: 'Email', value: 'email' },
    ],
    [],
  )

  useEffect(() => {
    getCustomers()
  }, [params])

  return (
    <>
      <TanstackTable
        columns={columns}
        data={customers}
        isLoading={isLoading}
        mode="server"
        pageCount={apiPagination?.totalPages}
        filterByOptions={filterByOptions}
        actions={
          <button
            className="bg-sky-600 text-white px-3 py-1.5 rounded text-sm"
            onClick={() => router.push('/admin/customers/add')}
          >
            Add New
          </button>
        }
      />
      <ConfirmationModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false })}
        onConfirm={handleDelete}
        title="Delete Customer"
        description="Are you sure you want to delete this customer?"
        confirmText="Delete"
        theme="error"
      />
    </>
  )
}

export default function CustomersPage() {
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
      <CustomersPageContent />
    </Suspense>
  )
}
