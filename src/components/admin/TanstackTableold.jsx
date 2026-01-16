'use client'

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useState } from 'react'
import TablePagination from './TablePagination'
import {
  FaSearch,
  FaSort,
  FaSortAlphaDown,
  FaSortAlphaDownAlt,
} from 'react-icons/fa'
import { ImBlocked } from 'react-icons/im'
import ButtonLoader from './ButtonLoader'

export function TanstackTableOld({
  columns,
  data,
  pageCount,
  pagination: externalPagination,
  sorting: externalSorting,
  onPaginationChange,
  onSortingChange,
  mode = 'client',
  isLoading,
  onSearch,
  filterByOptions = [],
  filterByValue,
  onFilterChange,
  actions,
}) {
  const [localPagination, setLocalPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const [localSorting, setLocalSorting] = useState([])
  const [search, setSearch] = useState('')

  const handleFilterChange = (value) => {
    // Only update filter value, don't trigger search
    setSearch('')
    onFilterChange?.(value)
  }

  const pagination = mode === 'server' ? externalPagination : localPagination
  const totalPageCount = Math.ceil(data.length / pagination.pageSize)
  const sorting = mode === 'server' ? externalSorting : localSorting

  const table = useReactTable({
    data,
    columns,
    pageCount: mode === 'server' ? pageCount : undefined,
    state: { pagination, sorting },
    manualPagination: mode === 'server',
    manualSorting: mode === 'server',
    onPaginationChange:
      mode === 'server' ? onPaginationChange : setLocalPagination,
    onSortingChange: mode === 'server' ? onSortingChange : setLocalSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: mode === 'client' ? getSortedRowModel() : undefined,
    getPaginationRowModel:
      mode === 'client' ? getPaginationRowModel() : undefined,
  })

  return (
    <div>
      {Boolean(filterByOptions?.length) && (
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3">
          <div className="flex gap-2">
            <select
              className="border border-gray-300 bg-gray-100 px-3 py-1.5 text-sm rounded-xs"
              value={filterByValue ?? ''}
              onChange={(e) => handleFilterChange(e.target.value)}
            >
              <option value="" disabled hidden>
                {'Filter By'}
              </option>
              {filterByOptions.map((opt) => (
                <option key={opt.label} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {filterByValue ? (
              (() => {
                const selectedFilter = filterByOptions.find(
                  (opt) => opt.value === filterByValue,
                )
                const filterType = selectedFilter?.type || 'text'

                if (filterType === 'select') {
                  const options = selectedFilter.options || []
                  return (
                    <select
                      className="border border-gray-300 px-3 py-1.5 text-sm rounded-xs w-48"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    >
                      <option value="">All {selectedFilter.label}</option>
                      {options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  )
                }

                return (
                  <input
                    className="border border-gray-300 px-3 py-1.5 text-sm rounded-xs w-48"
                    placeholder={`Search by ${selectedFilter?.label || '...'}`}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && onSearch(search)}
                  />
                )
              })()
            ) : (
              <input
                className="border border-gray-300 px-3 py-1.5 text-sm rounded-xs w-48"
                placeholder="Search term..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && onSearch(search)}
                disabled
              />
            )}

            <button
              onClick={() => onSearch?.(search)}
              className="bg-sky-600 text-white px-3 py-1.5 rounded text-sm"
            >
              <FaSearch />
            </button>
            {(filterByValue || search) && (
              <button
                onClick={() => {
                  onFilterChange('')
                  setSearch('')
                  onSearch?.('')
                }}
                className="bg-red-400 disabled:bg-gray-400 text-white px-3 py-1.5 rounded text-sm"
              >
                <ImBlocked />
              </button>
            )}
          </div>
          {actions}
        </div>
      )}

      <div className="py-4">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-100 border-b">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort()
                  const dir = header.column.getIsSorted()
                  return (
                    <th
                      key={header.id}
                      onClick={
                        canSort
                          ? header.column.getToggleSortingHandler()
                          : undefined
                      }
                      className={`p-2 text-left font-semibold text-gray-700 border border-gray-200 ${
                        canSort ? 'cursor-pointer select-none text-sky-600' : ''
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {canSort && (
                          <span className="text-xs text-gray-400">
                            {dir === 'asc' ? (
                              <FaSortAlphaDown className="text-black text-sm" />
                            ) : dir === 'desc' ? (
                              <FaSortAlphaDownAlt className="text-black text-sm" />
                            ) : (
                              <FaSort className="text-black text-sm" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="p-4 text-center">
                  <div className="flex justify-center items-center">
                    <ButtonLoader className="inline-flex text-sky-600" />{' '}
                    Loading...
                  </div>
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-4 text-center">
                  No records found
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="even:bg-gray-50 hover:bg-gray-100">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-2 border border-gray-200">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {((mode === 'server' && onPaginationChange) ||
        (mode === 'client' && data?.length > 0 && totalPageCount > 1)) && (
        <div className="flex justify-end items-center gap-1 p-3 text-sm">
          <TablePagination
            pageIndex={pagination.pageIndex}
            pageCount={mode === 'server' ? pageCount : totalPageCount}
            onPageChange={(newIndex) =>
              (mode === 'server' ? onPaginationChange : setLocalPagination)?.(
                (old) => ({
                  ...old,
                  pageIndex: newIndex,
                }),
              )
            }
          />
        </div>
      )}
    </div>
  )
}
