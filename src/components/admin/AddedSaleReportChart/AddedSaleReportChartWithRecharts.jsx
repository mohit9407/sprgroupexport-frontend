'use client'

import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { fetchAddedSaleReport } from '@/features/admin-dashboard/adminDashboardSlice'

const AddedSaleReportChartWithRecharts = () => {
  const dispatch = useDispatch()
  const { addedSaleReport, addedSaleReportLoading, addedSaleReportError } =
    useSelector((state) => state.adminDashboard)

  const [selectedFilter, setSelectedFilter] = useState('thisMonth')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')

  // Use ref to track last fetched filter to prevent duplicate calls
  const lastFetchedFilter = useRef(null)

  // Fetch data when filter changes (but not for custom)
  useEffect(() => {
    if (
      selectedFilter !== 'custom' &&
      selectedFilter !== lastFetchedFilter.current
    ) {
      console.log('Fetching data for filter:', selectedFilter)
      lastFetchedFilter.current = selectedFilter
      dispatch(
        fetchAddedSaleReport({
          filter: selectedFilter,
          startDate: '',
          endDate: '',
        }),
      )
    }
  }, [selectedFilter]) // Remove dispatch from dependencies

  // Handle custom date apply (only when user clicks Apply)
  const handleApplyCustomDates = () => {
    console.log('Applying custom dates:', customStartDate, customEndDate)
    if (customStartDate && customEndDate) {
      const customFilterKey = `custom-${customStartDate}-${customEndDate}`
      if (customFilterKey !== lastFetchedFilter.current) {
        lastFetchedFilter.current = customFilterKey
        dispatch(
          fetchAddedSaleReport({
            filter: 'custom',
            startDate: customStartDate,
            endDate: customEndDate,
          }),
        )
      }
    }
  }

  // Calculate totals
  const totalSold = addedSaleReport.reduce(
    (sum, item) => sum + (item.soldProducts || 0),
    0,
  )
  const totalAdded = addedSaleReport.reduce(
    (sum, item) => sum + (item.addedProducts || 0),
    0,
  )

  const filterOptions = [
    { value: 'lastYear', label: 'Last Year' },
    { value: 'lastMonth', label: 'Last Month' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'custom', label: 'Custom' },
  ]

  // Show loading state
  if (addedSaleReportLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Added/Sale Report
          </h2>
        </div>
        <div className="p-6 flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  // Show error state
  if (addedSaleReportError) {
    return (
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Added/Sale Report
          </h2>
        </div>
        <div className="p-6 flex justify-center items-center h-64">
          <div className="text-red-600">Error: {error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm mt-8">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Added/Sale Report
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Track your product sales and additions
            </p>
          </div>

          {/* Date Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedFilter(option.value)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  selectedFilter === option.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Date Range Picker */}
        {selectedFilter === 'custom' && (
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleApplyCustomDates}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Chart using Recharts */}
      <div className="p-6">
        {addedSaleReport.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={addedSaleReport}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Legend
                  wrapperStyle={{
                    paddingTop: '20px',
                  }}
                />
                <Bar
                  dataKey="soldProducts"
                  fill="#3b82f6"
                  name="Sold Products"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="addedProducts"
                  fill="#10b981"
                  name="Added Products"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200">
              <div className="text-center">
                <p className="text-sm text-gray-500">Total Sold Products</p>
                <p className="text-2xl font-bold text-blue-600">{totalSold}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Total Added Products</p>
                <p className="text-2xl font-bold text-green-600">
                  {totalAdded}
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">
              No data available for the selected period
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AddedSaleReportChartWithRecharts
