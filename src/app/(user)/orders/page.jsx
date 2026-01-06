'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { fetchUserOrders, resetOrderState } from '@/features/order/orderSlice'
import { toast } from '@/utils/toastConfig'
import Link from 'next/link'
import { FiShoppingBag, FiExternalLink } from 'react-icons/fi'
import Image from 'next/image'
import { fetchProducts } from '@/features/products/productsSlice'

export default function OrdersPage() {
  const [isClient, setIsClient] = useState(false)
  const dispatch = useDispatch()
  const router = useRouter()

  const {
    userOrders = [],
    loading,
    error,
  } = useSelector((state) => state.order)
  const { items: products = [] } = useSelector((state) => state.products)

  useEffect(() => {
    const id = setTimeout(() => setIsClient(true), 0)
    dispatch(fetchUserOrders())
    if (products.length === 0) {
      dispatch(fetchProducts({ limit: 1000 }))
    }

    return () => {
      clearTimeout(id)
      dispatch(resetOrderState())
    }
  }, [dispatch, products.length])

  // Function to get product details by ID
  const getProductById = (productId) => {
    return products.find((product) => product._id === productId) || null
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  const orders = Array.isArray(userOrders) ? userOrders : []

  if (error) {
    toast.error(error)
  }

  // Format date to a more readable format
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return isClient
      ? date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : date.toISOString().split('T')[0] // Fallback for SSR
  }

  // Get product details for an order item
  const getOrderItemDetails = (item) => {
    const product = getProductById(item.productId?._id || item.productId)
    return {
      ...item,
      product: product || {
        _id: item.productId?._id,
        name: item.productId?.productName || 'Product Not Found',
        image: item.productId?.image || null,
        price: item.productId.price || 0,
        category: item.productId?.category || 'Uncategorized',
        sku: item.productId?.sku || 'N/A',
        description: item.productId?.description || '',
      },
      quantity: item.quantity || 1,
      totalPrice: (item.quantity || 1) * (item.price || 0),
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
            <p className="text-gray-600 mt-1">View and track your orders</p>
          </div>
          <Link
            href="/products"
            className="mt-4 md:mt-0 inline-flex items-center justify-center px-6 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-[#BA8B4E] hover:bg-[#a87d45] transition-colors"
          >
            Continue Shopping
          </Link>
        </div>

        {orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-lg shadow overflow-hidden border border-gray-200"
              >
                {/* Order Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="mb-2 sm:mb-0">
                    <h3 className="text-lg font-medium text-gray-900">
                      Order #
                      {order.orderId ||
                        order._id?.substring(0, 8).toUpperCase()}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Placed on {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        order.orderStatus === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : order.orderStatus === 'processing'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {order.orderStatus
                        ? order.orderStatus.charAt(0).toUpperCase() +
                          order.orderStatus.slice(1)
                        : 'Pending'}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="divide-y divide-gray-200">
                  {order.products?.map((item, index) => {
                    const itemDetails = getOrderItemDetails(item)
                    return (
                      <div key={index} className="p-6">
                        <div className="flex flex-col sm:flex-row">
                          {/* Product Image */}
                          <div className="flex-shrink-0 w-full sm:w-32 h-32 bg-gray-100 rounded-md overflow-hidden mb-4 sm:mb-0 sm:mr-6">
                            {itemDetails.product?.image ? (
                              <Image
                                src={itemDetails.product.image}
                                alt={
                                  itemDetails.product.name ||
                                  `Product ${index + 1}`
                                }
                                width={128}
                                height={128}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                <FiShoppingBag className="text-gray-300 text-2xl" />
                              </div>
                            )}
                          </div>

                          {/* Product Details */}
                          <div className="flex-1">
                            <div className="flex flex-col h-full">
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="text-base font-medium text-gray-900">
                                      <Link
                                        href={`/products/${itemDetails.product?._id}`}
                                        className="hover:text-[#BA8B4E] transition-colors"
                                      >
                                        {itemDetails.product?.productName ||
                                          'Product'}
                                      </Link>
                                    </h4>
                                    <p className="text-sm text-gray-500 mt-1">
                                      SKU: {itemDetails.product?.sku}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      Category: {itemDetails.product?.category}
                                    </p>
                                  </div>
                                  <Link
                                    href={`/products/${itemDetails.product?._id}`}
                                    className="text-[#BA8B4E] hover:text-[#a87d45] text-sm flex items-center"
                                  >
                                    View Product{' '}
                                    <FiExternalLink
                                      className="ml-1"
                                      size={14}
                                    />
                                  </Link>
                                </div>

                                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                                  <div>
                                    <span className="text-gray-500">
                                      Quantity:
                                    </span>{' '}
                                    <span className="font-medium">
                                      {itemDetails.quantity || 1}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">
                                      Price:
                                    </span>{' '}
                                    <span className="font-medium">
                                      ₹
                                      {itemDetails.product.price
                                        ? itemDetails.product.price.toFixed(2)
                                        : '0.00'}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {index === 0 && order.products.length > 1 && (
                                <p className="mt-3 pt-2 border-t border-gray-100 text-sm text-gray-500">
                                  + {order.products.length - 1} more item
                                  {order.products.length > 2 ? 's' : ''} in this
                                  order
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Order Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="mb-3 sm:mb-0">
                    {order.comments && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Note:</span>{' '}
                        {order.comments}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col sm:items-end">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        Order Total:{' '}
                        <span className="font-medium text-gray-900">
                          ₹
                          {typeof order.total === 'number'
                            ? order.total.toFixed(2)
                            : '0.00'}
                        </span>
                      </p>
                    </div>
                    <Link
                      href={`/orders/${order._id}`}
                      className="mt-2 inline-flex items-center text-sm font-medium text-[#BA8B4E] hover:text-[#a87d45]"
                    >
                      View Order Details
                      <svg
                        className="ml-1 w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 py-16 px-6 text-center">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiShoppingBag className="text-4xl text-gray-300" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              {error ? 'Unable to load orders' : 'No orders yet'}
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {error
                ? 'There was an error loading your orders. Please try again later.'
                : 'You haven&apos;t placed any orders yet. Start shopping to see your orders here.'}
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-[#BA8B4E] hover:bg-[#a87d45] transition-colors"
            >
              {error ? 'Try Again' : 'Start Shopping'}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
