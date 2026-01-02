'use client'

import { useEffect, useState } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import { TanstackTable } from '@/components/admin/TanstackTable'
import { RowActionsMenu } from '@/components/admin/RowActionMenu'
import api from '@/lib/axios'
import { getAddressString } from '@/utils/stringUtils'
import { useRouter } from 'next/navigation'
import { getAllUsers } from '@/features/admin/customersService'

const columnHelper = createColumnHelper()

const columns = [
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
    header: 'Address',
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
              href: `/admin/customers/address/display/${id}`,
            },
            {
              label: 'Delete',
              danger: true,
              onClick: () => console.log('Delete', id),
            },
          ]}
        />
      )
    },
  }),
]

export default function CustomersPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const [totalPages, setTotalPages] = useState({
    total: 0,
    totalPages: 1,
  })
  const [sorting, setSorting] = useState([])
  const [filterBy, setFilterBy] = useState('')

  const getCustomers = async (search = '', page) => {
    setIsLoading(true)

    try {
      const sort = sorting[0]
      const sortType = sort?.desc ? 'desc' : 'asc'
      const res = await getAllUsers({
        search: search ?? undefined,
        sortBy: sort?.id,
        direction: sort?.id ? sortType : undefined,
        page: page ?? pagination.pageIndex + 1,
        limit: pagination.pageSize ?? 10,
        filterBy: filterBy || undefined,
      })

      const normalized =
        res?.data?.map((u) => {
          const defaultAddress = u.shippingAddress?.find((a) => a.isDefault)

          return {
            id: u._id,
            name: `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim(),
            email: u.email,
            phone: u.mobileNo || '-',
            address: getAddressString(defaultAddress) || '-',
          }
        }) || []

      setCustomers(normalized)
      setTotalPages(res?.pagination)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getCustomers()
  }, [pagination.pageIndex, sorting])

  return (
    <TanstackTable
      columns={columns}
      data={customers}
      isLoading={isLoading}
      mode="server"
      pageCount={totalPages?.totalPages}
      pagination={pagination}
      sorting={sorting}
      onPaginationChange={setPagination}
      onSortingChange={setSorting}
      onSearch={(val) => {
        setPagination((p) => ({ ...p, pageIndex: 0 }))
        getCustomers(val, 1)
      }}
      filterByValue={filterBy}
      filterByOptions={[
        { label: 'Name', value: 'name' },
        { label: 'Email', value: 'email' },
      ]}
      onFilterChange={setFilterBy}
      actions={
        <button
          className="bg-sky-600 text-white px-3 py-1.5 rounded text-sm"
          onClick={() => router.push('/admin/customers/add')}
        >
          Add New
        </button>
      }
    />
  )
}
