'use client'

import { useEffect, useMemo, useState } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import { TanstackTable } from '@/components/admin/TanstackTable'
import { RowActionsMenu } from '@/components/admin/RowActionMenu'
import api from '@/lib/axios'
import { getAddressString, shortenId } from '@/utils/stringUtils'
import { debounce } from 'lodash'

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
  const [customers, setCustomers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const [sorting, setSorting] = useState([])
  const [filterBy, setFilterBy] = useState('')
  const [search, setSearch] = useState('')

  // Fetch customers on mount
  const getCustomers = async () => {
    setIsLoading(true)
    try {
      const res = await api.get('/auth/get-all-users')
      const normalized = res.map((u, index) => {
        const defaultAddress = u.shippingAddress?.find((a) => a.isDefault)
        return {
          id: u._id,
          name: `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim(),
          email: u.email,
          phone: u.mobileNo || '-',
          address: getAddressString(defaultAddress) || '-',
        }
      })
      setCustomers(normalized)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getCustomers()
  }, [])

  // Memoized filter and sorting logic
  const filteredData = useMemo(() => {
    let data = [...customers]

    if (search && filterBy) {
      const s = search.toLowerCase()
      data = data.filter((c) => c?.[filterBy]?.toLowerCase().includes(s))
    }

    if (sorting.length) {
      const { id, desc } = sorting[0]
      data.sort((a, b) => {
        if (a[id] < b[id]) return desc ? 1 : -1
        if (a[id] > b[id]) return desc ? -1 : 1
        return 0
      })
    }

    return data
  }, [customers, search, sorting, filterBy])

  const paginatedData = useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize
    return filteredData.slice(start, start + pagination.pageSize)
  }, [filteredData, pagination])

  const pageCount = Math.ceil(filteredData.length / pagination.pageSize)

  // Debounced search handler
  const debouncedSearch = useMemo(
    () => debounce((query) => setSearch(query), 500),
    [],
  )

  return (
    <TanstackTable
      columns={columns}
      data={paginatedData}
      isLoading={isLoading}
      mode="server"
      pageCount={pageCount}
      pagination={pagination}
      sorting={sorting}
      onPaginationChange={setPagination}
      onSortingChange={setSorting}
      onSearch={debouncedSearch}
      filterByValue={filterBy}
      filterByOptions={[
        { label: 'Name', value: 'name' },
        { label: 'Email', value: 'email' },
      ]}
      onFilterChange={(val) => setFilterBy(val)}
      actions={
        <button className="bg-sky-600 text-white px-3 py-1.5 rounded text-sm">
          Add New
        </button>
      }
    />
  )
}
