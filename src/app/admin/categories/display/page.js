'use client'

import { useMemo, useState } from 'react'
import DataTable from '@/components/admin/DataTable'

const mockCategories = [
  {
    id: 1,
    name: 'Women',
    image: '/images/sample1.jpg',
    icon: '/images/sample1.jpg',
    addedAt: '2021-04-06 01:44:50',
    modifiedAt: '2023-04-20 07:14:23',
    status: 'Active',
  },
  {
    id: 2,
    name: 'Women / Platinum',
    image: '/images/sample2.jpg',
    icon: '/images/sample2.jpg',
    addedAt: '2021-04-06 01:44:50',
    modifiedAt: '2023-03-21 12:29:36',
    status: 'Active',
  },
  {
    id: 3,
    name: 'Platinum / Ring',
    image: '/images/sample3.jpg',
    icon: '/images/sample3.jpg',
    addedAt: '2021-04-06 01:44:50',
    modifiedAt: '2023-03-30 01:26:27',
    status: 'Inactive',
  },
]

export default function CategoriesDisplayPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [sortBy, setSortBy] = useState('id')
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(1)
  const pageSize = 10

  const filtered = useMemo(() => {
    let list = [...mockCategories]
    if (status !== 'all')
      list = list.filter((i) => i.status.toLowerCase() === status)
    if (search)
      list = list.filter((i) =>
        i.name.toLowerCase().includes(search.toLowerCase()),
      )

    list.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1
      const av = a[sortBy]
      const bv = b[sortBy]
      if (typeof av === 'number' && typeof bv === 'number')
        return (av - bv) * dir
      return String(av).localeCompare(String(bv)) * dir
    })
    return list
  }, [search, status, sortBy, sortDir])

  const columns = [
    { key: 'id', header: 'ID', sortable: true, width: 60 },
    { key: 'name', header: 'Name', sortable: true },
    {
      key: 'image',
      header: 'Image',
      renderCell: (v) => (
        <div className="w-20 h-20 bg-gray-100 grid place-items-center overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={v} alt="" className="object-cover w-full h-full" />
        </div>
      ),
      align: 'center',
      width: 120,
    },
    {
      key: 'icon',
      header: 'Icon',
      renderCell: (v) => (
        <div className="w-20 h-20 bg-gray-100 grid place-items-center overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={v} alt="" className="object-cover w-full h-full" />
        </div>
      ),
      align: 'center',
      width: 120,
    },
    {
      key: 'addedAt',
      header: 'Added/Last Modified Date',
      renderCell: (_, row) => (
        <div>
          <div>
            <span className="font-semibold">Added Date:</span> {row.addedAt}
          </div>
          <div>
            <span className="font-semibold">Modified Date:</span>{' '}
            {row.modifiedAt}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      renderCell: (v) => (
        <span
          className={`px-2 py-1 rounded text-xs font-semibold ${v === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
        >
          {v}
        </span>
      ),
      align: 'center',
      width: 100,
    },
    {
      key: 'actions',
      header: 'Action',
      renderCell: (_, row) => (
        <div className="flex items-center gap-2 justify-center">
          <button
            className="p-1.5 rounded bg-blue-500 hover:bg-blue-600 text-white"
            onClick={() => alert(`Edit ${row.name}`)}
            title="Edit"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652l-9.193 9.193a4.5 4.5 0 01-1.897 1.125L6 17.25l.781-4.111a4.5 4.5 0 011.125-1.897l8.956-8.956z" />
              <path d="M19.5 7.125L17.25 4.875" />
              <path
                fillRule="evenodd"
                d="M5.25 19.5A2.25 2.25 0 007.5 21.75h9a2.25 2.25 0 002.25-2.25V12a.75.75 0 00-1.5 0v7.5a.75.75 0 01-.75.75h-9a.75.75 0 01-.75-.75V7.5a.75.75 0 01.75-.75H15a.75.75 0 000-1.5H7.5A2.25 2.25 0 005.25 7.5v12z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <button
            className="p-1.5 rounded bg-red-500 hover:bg-red-600 text-white"
            onClick={() => alert(`Delete ${row.name}`)}
            title="Delete"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path
                fillRule="evenodd"
                d="M16.5 4.478V5.25h3.75a.75.75 0 010 1.5h-.355l-1.17 12.099A2.25 2.25 0 0116.484 21H7.516a2.25 2.25 0 01-2.242-2.151L4.105 6.75H3.75a.75.75 0 010-1.5H7.5v-.772A2.25 2.25 0 019.75 1.5h4.5a2.25 2.25 0 012.25 2.25zM9.75 5.25h4.5v-.772a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V5.25zm-2.37 2.25l1.06 11h7.12l1.06-11H7.38z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      ),
      align: 'center',
      width: 120,
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={filtered}
      sortBy={sortBy}
      sortDir={sortDir}
      onSortChange={(key, dir) => {
        setSortBy(key)
        setSortDir(dir)
      }}
      page={page}
      pageSize={pageSize}
      total={filtered.length}
      onPageChange={setPage}
    />
  )
}
