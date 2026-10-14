'use client'

import { useEffect, useMemo, useState, Suspense } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import { RowActionsMenu } from '@/components/admin/RowActionMenu'
import { getAddressString } from '@/utils/stringUtils'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import {
  getAllCustomers,
  deleteCustomer,
} from '@/features/customers/customersSlice'
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
  const [customerPassword, setCustomerPassword] = useState('')
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [isUnlocking, setIsUnlocking] = useState(false)
  const [accessError, setAccessError] = useState('')
  const {
    data,
    pagination: apiPagination,
    isLoading,
  } = useSelector((state) => state.customers.allCustomers)

  const columns = useMemo(
    () => getColumns((id) => setDeleteModal({ open: true, id })),
    [],
  )

  const getCustomers = async (accessPassword) => {
    try {
      await dispatch(
        getAllCustomers({
          accessPassword,
          search: params?.search ?? undefined,
          sortBy: params?.sortBy,
          sortOrder: params?.sortBy ? params.direction : undefined,
          page: params?.pageIndex + 1,
          limit: params?.pageSize ?? 10,
          filterBy: params?.filterBy || undefined,
        }),
      ).unwrap()
      return true
    } catch {
      return false
    }
  }

  const unlockCustomerTable = async (event) => {
    event.preventDefault()
    setIsUnlocking(true)
    setAccessError('')
    const isValid = await getCustomers(customerPassword)
    if (isValid) {
      setIsUnlocked(true)
    } else {
      setAccessError('Password incorrect or access unavailable. Try again.')
    }
    setIsUnlocking(false)
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
    if (isUnlocked && customerPassword) {
      getCustomers(customerPassword)
    }
  }, [params, isUnlocked, customerPassword])

  const lockCustomerTable = () => {
    setCustomerPassword('')
    setIsUnlocked(false)
    setAccessError('')
  }

  if (!isUnlocked) {
    return (
      <div className="max-w-md mx-auto mt-10 rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">
          Customer table locked
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Enter the private access password to view customer information.
        </p>
        <form onSubmit={unlockCustomerTable} className="mt-5 space-y-3">
          <label
            htmlFor="customer-table-password"
            className="block text-sm font-medium text-gray-700"
          >
            Access password
          </label>
          <input
            id="customer-table-password"
            type="password"
            autoComplete="current-password"
            value={customerPassword}
            onChange={(event) => setCustomerPassword(event.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 outline-none focus:border-[#004372] focus:ring-1 focus:ring-[#004372]"
            required
          />
          {accessError && <p className="text-sm text-red-600">{accessError}</p>}
          <button
            type="submit"
            disabled={isUnlocking}
            className="rounded bg-[#004372] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {isUnlocking ? 'Checking…' : 'Unlock'}
          </button>
        </form>
      </div>
    )
  }

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
          <div className="flex gap-2">
            <button
              className="bg-[#004372] text-white px-3 py-1.5 rounded text-sm"
              onClick={() => router.push('/admin/customers/add')}
            >
              Add New
            </button>
            <button
              className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700"
              onClick={lockCustomerTable}
            >
              Lock
            </button>
          </div>
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
