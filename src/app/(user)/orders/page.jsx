'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { fetchUserOrders, resetOrderState } from '@/features/order/orderSlice'
import { toast } from '@/utils/toastConfig'
import Link from 'next/link'
import {
  FiShoppingBag,
  FiExternalLink,
  FiCopy,
  FiChevronDown,
  FiChevronUp,
  FiPackage,
  FiTag,
  FiDollarSign,
} from 'react-icons/fi'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchProducts } from '@/features/products/productsSlice'
import { fetchAllCategories } from '@/features/categories/categoriesSlice'
import { FaRupeeSign } from 'react-icons/fa'

export default function OrdersPage() {
  const [isClient, setIsClient] = useState(false)
  const [expandedOrders, setExpandedOrders] = useState({})
  const dispatch = useDispatch()
  const router = useRouter()

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }))
  }

  const {
    userOrders = [],
    loading,
    error,
  } = useSelector((state) => state.order)
  const { items: products = [] } = useSelector((state) => state.products)
  const { data: categories = [] } = useSelector(
    (state) => state.categories?.allCategories || { data: [] },
  )

  useEffect(() => {
    const id = setTimeout(() => setIsClient(true), 0)
    dispatch(fetchUserOrders())
    if (products.length === 0) {
      dispatch(fetchProducts({ limit: 1000 }))
    }
    if (categories.length === 0) {
      dispatch(fetchAllCategories())
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

  const getCategoryNameById = (categoryId) => {
    if (!categoryId || !Array.isArray(categories)) return 'Uncategorized'
    const category = categories.find((cat) => cat?._id === categoryId)
    if (category) return category.name
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

  const copyOrderId = async (orderId) => {
    try {
      await navigator.clipboard.writeText(orderId)
      toast.success('Order ID copied to clipboard!')
    } catch (err) {
      toast.error('Failed to copy order ID')
    }
  }

  // Get product details for an order item
  const getOrderItemDetails = (item) => {
    if (!item) {
      return {
        product: {
          name: 'Product Not Found',
          image: null,
          price: 0,
          category: 'Uncategorized',
          sku: 'N/A',
          description: '',
        },
        quantity: 1,
        totalPrice: 0,
      }
    }

    const product = getProductById(item.productId?._id || item.productId)
    const categoryId = product?.category || item.productId?.category
    const categoryName =
      typeof categoryId === 'object'
        ? categoryId?.name
        : getCategoryNameById(categoryId)
    const resolvedProductName =
      product?.productName || item.productId?.productName || 'Product Not Found'
    return {
      ...item,
      product: {
        ...(product || {}),
        _id: item.productId?._id,
        name: resolvedProductName,
        productName: resolvedProductName,
        price: item.productId?.price || 0,
        category: categoryName || 'Uncategorized',
        sku:
          product?.sku ||
          item.productId?.sku ||
          item.productId?.productModel ||
          item.sku ||
          'N/A',
        description: item.productId?.description || '',
      },
      quantity: item.quantity || 1,
      totalPrice:
        (item.quantity || 1) * (item.price || item.productId?.price || 0),
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
              <motion.div
                key={order._id}
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow duration-300"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Order Header */}
                <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="mb-2 sm:mb-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 mt-1">
                        <h2 className="text-gray-700 font-medium text-sm">
                          ORDER PLACED
                        </h2>
                        <p className="text-gray-900 font-medium">
                          {formatDate(order.createdAt)}
                        </p>
                        <Link
                          href={`/orders/${order._id}`}
                          className="inline-flex items-center text-sm font-medium text-[#BA8B4E] hover:text-[#a87d45] ml-[765px]"
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
                    <h3 className="text-lg font-medium text-gray-900">
                      Order{' '}
                      <span className="text-sm text-gray-600 font-mono">
                        ID: {order._id}
                      </span>
                      <button
                        onClick={() => copyOrderId(order._id)}
                        className="text-gray-400 hover:text-gray-600 transition-colors ml-1"
                        title="Copy order ID"
                      >
                        <FiCopy size={14} />
                      </button>
                    </h3>
                  </div>
                  {/* <div className="flex items-center">
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
                  </div> */}
                </div>

                {/* Order Items */}
                <div className="divide-y divide-gray-100">
                  <AnimatePresence>
                    {order.products?.map((item, index) => {
                      // Only show first item by default, or all if expanded
                      if (!expandedOrders[order._id] && index > 0) return null

                      const itemDetails = getOrderItemDetails(item)
                      return (
                        <motion.div
                          key={index}
                          className="p-6 hover:bg-gray-50 transition-colors duration-200"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="flex flex-col sm:flex-row group">
                            {/* Product Image with Hover Effect */}
                            <div className="flex-shrink-0 w-full sm:w-36 h-36 bg-gray-50 rounded-lg overflow-hidden mb-4 sm:mb-0 sm:mr-6 border border-gray-100 transition-all duration-300 group-hover:shadow-md">
                              {itemDetails.product?.image ? (
                                <Image
                                  src={itemDetails.product.image.thumbnailUrl}
                                  alt={
                                    itemDetails.product.name ||
                                    `Product ${index + 1}`
                                  }
                                  width={144}
                                  height={144}
                                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 text-gray-300">
                                  <FiPackage className="text-3xl mb-2" />
                                  <span className="text-xs">No Image</span>
                                </div>
                              )}
                            </div>

                            {/* Product Details */}
                            <div className="flex-1">
                              <div className="flex flex-col h-full">
                                <div className="flex-1">
                                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                      <h4 className="text-lg font-semibold text-gray-900 group-hover:text-[#BA8B4E] transition-colors">
                                        <Link
                                          href={`/products/${itemDetails.product?._id}`}
                                          className="hover:underline"
                                        >
                                          {itemDetails.product?.productName ||
                                            'Product'}
                                        </Link>
                                      </h4>
                                      <div className="flex items-center mt-2 text-sm text-gray-500">
                                        <FiTag className="mr-1.5" size={14} />
                                        <span>
                                          SKU:{' '}
                                          {itemDetails.product?.sku || 'N/A'}
                                        </span>
                                      </div>
                                      <div className="flex items-center mt-1 text-sm text-gray-500">
                                        <span className="inline-block w-2 h-2 rounded-full bg-green-400 mr-1.5"></span>
                                        <span>
                                          Category:{' '}
                                          {itemDetails.product?.category ||
                                            'N/A'}
                                        </span>
                                      </div>
                                    </div>
                                    <Link
                                      href={`/products/${itemDetails.product?._id}`}
                                      className="mt-2 sm:mt-0 inline-flex items-center px-3 py-1.5 border border-[#BA8B4E] text-[#BA8B4E] rounded-full text-xs font-medium hover:bg-[#f9f5f0] transition-colors"
                                    >
                                      View Product Details
                                      <FiExternalLink
                                        className="ml-1"
                                        size={12}
                                      />
                                    </Link>
                                  </div>

                                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                      <div className="text-xs text-gray-500 mb-1">
                                        Quantity
                                      </div>
                                      <div className="font-medium text-gray-900">
                                        {itemDetails.quantity || 1}
                                      </div>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                      <div className="text-xs text-gray-500 mb-1">
                                        Price
                                      </div>
                                      <div className="font-medium text-gray-900 flex items-center">
                                        <FaRupeeSign
                                          size={14}
                                          className="mr-0.5"
                                        />
                                        {itemDetails.product.price
                                          ? itemDetails.product.price.toFixed(2)
                                          : '0.00'}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>

                  {/* Show more/less button for orders with multiple items */}
                  {order.products?.length > 1 && (
                    <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
                      <button
                        onClick={() => toggleOrderExpansion(order._id)}
                        className="w-full py-2.5 px-4 bg-white border border-gray-200 rounded-lg shadow-sm text-sm font-medium text-[#BA8B4E] hover:bg-[#f9f5f0] hover:border-[#d4b78f] transition-all duration-200 flex items-center justify-center group"
                      >
                        {expandedOrders[order._id] ? (
                          <>
                            <span>Show less</span>
                            <FiChevronUp
                              className="ml-2 group-hover:translate-y-[-2px] transition-transform"
                              size={16}
                            />
                          </>
                        ) : (
                          <>
                            <span>
                              View {order.products.length - 1} more item
                              {order.products.length > 2 ? 's' : ''}
                            </span>
                            <FiChevronDown
                              className="ml-2 group-hover:translate-y-[2px] transition-transform"
                              size={16}
                            />
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Order Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="mb-3 sm:mb-0">
                    {order.comments && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Note:</span>{' '}
                        {order.comments}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
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
