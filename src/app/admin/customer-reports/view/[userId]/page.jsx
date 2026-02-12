'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
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
} from 'react-icons/fi'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchProducts } from '@/features/products/productsSlice'
import { fetchAllCategories } from '@/features/categories/categoriesSlice'
import { FaRupeeSign } from 'react-icons/fa'

export default function CustomerOrdersPage() {
  const [isClient, setIsClient] = useState(false)
  const [expandedOrders, setExpandedOrders] = useState({})
  const dispatch = useDispatch()
  const router = useRouter()
  const { userId } = useParams()

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
    if (userId) {
      dispatch(fetchUserOrders(userId))
    }
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
  }, [dispatch, userId, products.length])

  const getProductById = (productId) => {
    const id = typeof productId === 'object' ? productId?._id : productId
    return products.find((product) => product._id === id) || null
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date
      .toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Asia/Kolkata',
      })
      .replace(',', '')
  }

  const copyOrderId = (id) => {
    navigator.clipboard.writeText(id)
    toast.success('Order ID copied to clipboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <FiChevronUp className="mr-1 rotate-270" />
            Back to Customer Reports
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Customer Orders ({orders.length})
          </h1>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <FiShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No orders
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              This customer has not placed any orders yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Order Header */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order {order._id}
                          <button
                            onClick={() => copyOrderId(order._id)}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                            title="Copy order ID"
                          >
                            <FiCopy size={16} />
                          </button>
                        </h3>
                        <p className="text-sm text-gray-500">
                          Placed on {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleOrderExpansion(order._id)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {expandedOrders[order._id] ? (
                          <FiChevronUp size={25} />
                        ) : (
                          <FiChevronDown size={25} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Order Status</p>
                      <p className="font-medium">
                        {order.orderStatus?.name || 'Pending'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Payment Status</p>
                      <p className="font-medium">
                        {order.paymentStatus?.paymentStatus}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Items</p>
                      <p className="font-medium">
                        {order.products?.length || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total</p>
                      <p className="font-medium flex items-center">
                        <FaRupeeSign size={12} />
                        {(order.total || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  {/* Expanded Order Details */}
                  <AnimatePresence>
                    {expandedOrders[order._id] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-gray-200 pt-4 mt-4"
                      >
                        <div className="space-y-4">
                          {order.products?.map((item, index) => {
                            const product = getProductById(item.productId)
                            return (
                              <div
                                key={index}
                                className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                              >
                                {product?.image ? (
                                  <Image
                                    src={
                                      product.image?.thumbnailUrl ||
                                      product.image?.mediumUrl
                                    }
                                    alt={product.productName || 'Product'}
                                    width={60}
                                    height={60}
                                    className="rounded-lg object-cover"
                                  />
                                ) : (
                                  <div className="w-[60px] h-[60px] bg-gray-200 rounded-lg flex items-center justify-center">
                                    <FiPackage
                                      className="text-gray-400"
                                      size={24}
                                    />
                                  </div>
                                )}
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900">
                                    {product?.productName || 'Product'}
                                  </h4>
                                  <p className="text-sm text-gray-500">
                                    {getCategoryNameById(product?.category)}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Quantity: {item.quantity}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Sku: {product.sku}
                                  </p>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
