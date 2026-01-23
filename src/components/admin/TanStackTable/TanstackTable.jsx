'use client'

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { memo, startTransition, useEffect, useState } from 'react'
import {
  FaSearch,
  FaSort,
  FaSortAlphaDown,
  FaSortAlphaUpAlt,
} from 'react-icons/fa'
import { ImBlocked } from 'react-icons/im'
import { useTableQueryParams } from './utils'
import TablePagination from './TablePagination'
import ButtonLoader from '../ButtonLoader'

export const TanstackTable = memo(function TanstackTable({
  columns,
  data,
  pageCount,
  mode = 'client',
  isLoading,
  filterByOptions = [],
  actions,
}) {
  const isServerMode = mode === 'server'

  const { params, setParams } = useTableQueryParams()
  const [filterSearchDraft, setFilterSearchDraft] = useState({
    filterBy: '',
    search: '',
  })

  const handlePaginationChange = (updater) => {
    const next =
      typeof updater === 'function'
        ? updater({
          pageIndex: params.pageIndex,
          pageSize: params.pageSize,
        })
        : updater

    startTransition(() => setParams({ page: next.pageIndex + 1 }))
  }

  const handleSortingChange = (updater) => {
    const nextSorting =
      typeof updater === 'function'
        ? updater(
          params.sortBy
            ? [{ id: params.sortBy, desc: params.direction === 'desc' }]
            : [],
        )
        : updater

    if (!nextSorting.length) {
      startTransition(() =>
        setParams({
          sortBy: null,
          direction: null,
          page: 1,
        }),
      )
    } else {
      startTransition(() =>
        setParams({
          sortBy: nextSorting[0].id,
          direction: nextSorting[0].desc ? 'desc' : 'asc',
          page: 1,
        }),
      )
    }
  }

  const table = useReactTable({
    data,
    columns,
    pageCount: isServerMode ? pageCount : undefined,
    state: {
      pagination: {
        pageIndex: params.pageIndex,
        pageSize: params.pageSize,
      },
      sorting: params.sortBy
        ? [{ id: params.sortBy, desc: params.direction === 'desc' }]
        : [],
    },
    manualPagination: isServerMode,
    manualSorting: isServerMode,
    onPaginationChange: handlePaginationChange,
    onSortingChange: handleSortingChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: !isServerMode ? getSortedRowModel() : undefined,
    getPaginationRowModel: !isServerMode ? getPaginationRowModel() : undefined,
  })

  const handleSetFilterSearchParams = () => {
    setParams({ ...filterSearchDraft, page: 1 })
  }
  const resetFilterSearchParams = () => {
    const defaultFilter = { filterBy: '', search: '' }
    setFilterSearchDraft(defaultFilter)
    setParams({ ...defaultFilter, page: 1 })
  }

  const selectedFilter = filterByOptions.find(
    (opt) => opt.value === filterSearchDraft.filterBy,
  )
  const filterType = selectedFilter?.type || 'text'
  const options = selectedFilter?.options || []

  useEffect(() => {
    if (Object.keys(params || {})?.length) {
      setFilterSearchDraft({
        filterBy: params.filterBy,
        search: params.search,
      })
    }
  }, [])

  return (
    <div>
      {Boolean(filterByOptions?.length) && (
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3">
          <div className="flex gap-2">
            <select
              className="border border-gray-300 bg-gray-100 px-3 py-1.5 text-sm rounded-xs"
              value={filterSearchDraft.filterBy}
              onChange={(e) =>
                setFilterSearchDraft((old) => ({
                  ...old,
                  filterBy: e.target.value,
                }))
              }
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
            {filterType === 'select' ? (
              <select
                className="border border-gray-300 px-3 py-1.5 text-sm rounded-xs w-48"
                value={filterSearchDraft?.search}
                onChange={(e) =>
                  setFilterSearchDraft((old) => ({
                    ...old,
                    search: e.target.value,
                  }))
                }
              >
                <option value="">All {selectedFilter.label}</option>
                {options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                className="border border-gray-300 px-3 py-1.5 text-sm rounded-xs w-48"
                placeholder={`Search by ${selectedFilter?.label || '...'}`}
                value={filterSearchDraft?.search || ''}
                onChange={(e) =>
                  setFilterSearchDraft((old) => ({
                    ...old,
                    search: e.target.value,
                  }))
                }
                onKeyPress={(e) =>
                  e.key === 'Enter' && handleSetFilterSearchParams()
                }
              />
            )}

            <button
              onClick={handleSetFilterSearchParams}
              className="bg-sky-600 text-white px-3 py-1.5 rounded text-sm"
            >
              <FaSearch />
            </button>
            {(filterSearchDraft?.filterBy || filterSearchDraft?.search) && (
              <button
                onClick={resetFilterSearchParams}
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
                      className={`p-2 text-left font-semibold text-gray-700 border border-gray-200 ${canSort ? 'cursor-pointer select-none text-sky-600' : ''
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
                              <FaSortAlphaUpAlt className="text-black text-sm" />
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
            {isLoading && (
              <tr>
                <td colSpan={columns.length} className="p-4 text-center">
                  <div className="flex justify-center items-center">
                    <ButtonLoader className="inline-flex text-sky-600" />{' '}
                    Loading...
                  </div>
                </td>
              </tr>
            )}
            {!isLoading && table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-4 text-center">
                  No records found
                </td>
              </tr>
            ) : (
              table.getRowModel()?.rows?.map((row) => (
                <tr
                  key={row.id}
                  className={`even:bg-gray-50 hover:bg-gray-100`}
                >
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

      {pageCount > 1 && (
        <div className="flex justify-end items-center gap-1 p-3 text-sm">
          <TablePagination
            pageIndex={params?.pageIndex}
            pageCount={pageCount}
            onPageChange={(newIndex) =>
              setParams({
                pageIndex: newIndex + 1,
              })
            }
          />
        </div>
      )}
    </div>
  )
})

export default TanstackTable
