'use client'

import { useEffect, Suspense } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchAdminDashboard,
  fetchRecentOrders,
  fetchRecentCustomers,
  fetchRecentProducts,
  fetchGoalCompletion,
} from '@/features/admin-dashboard/adminDashboardSlice'
import { useRouter } from 'next/navigation'
import {
  ShoppingCartIcon,
  UserPlusIcon,
  ChartBarIcon,
  PackageIcon,
  ArrowRight,
} from 'lucide-react'
import Image from 'next/image'
import AddedSaleReportChartWithRecharts from '@/components/admin/AddedSaleReportChart/AddedSaleReportChartWithRecharts'
import { useMemo } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import { TanstackTable } from '@/components/admin/TanStackTable'

const columnHelper = createColumnHelper()

export default function AdminDashboard() {
  const dispatch = useDispatch()
  const router = useRouter()
  const {
    adminDashboard,
    recentOrders,
    recentCustomers,
    recentProducts,
    goalCompletion,
    loading,
    error,
  } = useSelector((state) => state.adminDashboard)

  useEffect(() => {
    dispatch(fetchAdminDashboard())
    dispatch(fetchRecentOrders())
    dispatch(fetchRecentCustomers())
    dispatch(fetchRecentProducts())
    dispatch(fetchGoalCompletion())
  }, [dispatch])

  const ordersColumns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'Order ID',
        enableSorting: false,
      }),
      columnHelper.accessor('customer', {
        header: 'Customer Name',
        enableSorting: false,
      }),
      columnHelper.accessor('total', {
        header: 'Total Price',
        enableSorting: false,
        cell: (info) => `₹${info.getValue()}`,
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        enableSorting: false,
        cell: (info) => {
          const status = info.getValue()?.toLowerCase()
          let className = 'bg-gray-100 text-gray-800'
          if (status === 'completed' || status === 'ompleted') {
            className = 'bg-green-100 text-green-800'
          } else if (status === 'pending') {
            className = 'bg-yellow-100 text-yellow-800'
          }
          return (
            <span
              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${className}`}
            >
              {info.getValue()}
            </span>
          )
        },
      }),
    ],
    [],
  )

  const customerColumns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'Order ID',
        enableSorting: false,
      }),
      columnHelper.accessor('name', {
        header: 'Name',
        enableSorting: false,
      }),
      columnHelper.accessor('email', {
        header: 'Email',
        enableSorting: false,
      }),
    ],
    [],
  )

  const stats = [
    {
      title: 'New Orders',
      value: adminDashboard?.newOrdersToday || 0,
      bgColor: 'bg-blue-500',
      textColor: 'text-white',
      icon: <ShoppingCartIcon className="h-8 w-8" />,
      link: '/admin/orders',
      extra: 'View All Orders',
    },
    {
      title: 'Total Purchased Money',
      value: `₹ ${adminDashboard?.totalPurchasedMoney?.toFixed(2) || '0.00'}`,
      bgColor: 'bg-blue-800',
      textColor: 'text-white',
      icon: <ChartBarIcon className="h-8 w-8" />,
      link: '/admin/orders',
      extra: 'View All Orders',
    },
    {
      title: 'Total Sale',
      value: adminDashboard?.totalSale || 0,
      bgColor: 'bg-teal-500',
      textColor: 'text-white',
      icon: <ChartBarIcon className="h-8 w-8" />,
      link: '/admin/orders',
      extra: 'View All Orders',
    },
    {
      title: 'Out of Stock',
      value: adminDashboard?.outOfStockProducts || 0,
      bgColor: 'bg-red-500',
      textColor: 'text-white',
      icon: <PackageIcon className="h-8 w-8" />,
      link: '/admin/out-of-stock',
      extra: 'Out of Stock',
    },
    {
      title: 'Customer Registrations',
      value: adminDashboard?.customerRegistrations || 0,
      bgColor: 'bg-orange-500',
      textColor: 'text-white',
      icon: <UserPlusIcon className="h-8 w-8" />,
      link: '/admin/customers',
      extra: 'View All Customers',
    },
    {
      title: 'Total Products',
      value: adminDashboard?.totalProducts || 0,
      bgColor: 'bg-green-500',
      textColor: 'text-white',
      icon: <PackageIcon className="h-8 w-8" />,
      link: '/admin/products',
      extra: 'View All Products',
    },
  ]

  // Use API data when available, fallback to static data for demonstration
  const ordersData = recentOrders || []
  const goalData = goalCompletion || {}
  const productsData = recentProducts || []

  const customersData = (recentCustomers || []).slice(0, 5)

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Original Stats Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`${stat.bgColor} p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300`}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3
                  className={`text-lg font-medium ${stat.textColor} opacity-90`}
                >
                  {stat.title}
                </h3>
                <p className={`mt-2 text-3xl font-bold ${stat.textColor}`}>
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.textColor} opacity-80`}>{stat.icon}</div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/20">
              <button
                onClick={() => router.push(stat.link)}
                className={`flex items-center justify-between ${stat.textColor} hover:opacity-80 transition-opacity duration-200 w-full`}
              >
                <span className="text-sm font-medium">{stat.extra}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Added/Sale Report Chart */}
      <AddedSaleReportChartWithRecharts />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* New Customers Section */}
        <div className="lg:col-span-2">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                New Customer(s)
              </h2>

              <Suspense
                fallback={<div className="p-4 text-center">Loading...</div>}
              >
                <TanstackTable
                  columns={customerColumns}
                  data={customersData}
                  isLoading={loading}
                  mode="client"
                />
              </Suspense>

              <button
                onClick={() => router.push('/admin/customers')}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors mt-4"
              >
                View All Customers
              </button>
            </div>
          </div>

          {/* New Orders Table */}
          <div className="lg:col-span-2 mt-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                New Orders
              </h2>

              <Suspense
                fallback={<div className="p-4 text-center">Loading...</div>}
              >
                <TanstackTable
                  columns={ordersColumns}
                  data={ordersData}
                  isLoading={loading}
                  mode="client"
                />
              </Suspense>

              <button
                onClick={() => router.push('/admin/orders')}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors mt-4"
              >
                View All Orders
              </button>
            </div>
          </div>
        </div>

        {/* Goal Completion */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Goal Completion
            </h2>
            <div className="space-y-4">
              {Object.entries(goalData).map(([key, goal]) => {
                const percentage = (goal.current / goal.target) * 100
                return (
                  <div key={key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{goal.label}</span>
                      <span className="font-medium text-gray-900">
                        {goal.current}/{goal.target}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Recently Added Products */}
          <div className="lg:col-span-1 mt-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Recently Added Products
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {productsData.map((product, index) => (
                  <div key={index} className="text-center">
                    <div className="bg-gray-100 rounded-lg p-3 mb-2">
                      <div className="w-12 h-12 bg-gray-300 rounded mx-auto">
                        <Image
                          src={
                            product.image.thumbnailUrl ||
                            '/placeholder-product.jpg'
                          }
                          width={96}
                          alt="image"
                          height={96}
                          className="w-full h-full object-cover"
                          priority
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 truncate">
                      {product.name}
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      ₹{product.price}
                    </p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => router.push('/admin/products')}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors mt-4"
              >
                View All Products
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
