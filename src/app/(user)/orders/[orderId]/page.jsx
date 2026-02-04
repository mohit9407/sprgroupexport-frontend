'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { fetchOrderById } from '@/features/order/orderService'
import { fetchProducts } from '@/features/products/productsSlice'
import { fetchAllCategories } from '@/features/categories/categoriesSlice'
import { getAddresses } from '@/features/shippingAddress/shippingAddressSlice'
import {
  FiArrowLeft,
  FiPackage,
  FiTruck,
  FiCreditCard,
  FiCopy,
  FiCheckCircle,
  FiShoppingBag,
} from 'react-icons/fi'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from '@/utils/toastConfig'

export default function OrderDetailsPage() {
  const { orderId } = useParams()
  const router = useRouter()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useSelector((state) => state.auth)
  const { addresses } = useSelector((state) => state.shippingAddress)
  const { items: products = [] } = useSelector((state) => state.products)
  const { data: categories = [] } = useSelector(
    (state) => state.categories?.allCategories || { data: [] },
  )
  const dispatch = useDispatch()

  // Find the shipping address from the order's shippingAddressId
  const shippingAddress = useMemo(() => {
    if (!order?.shippingAddressId) return null
    return Array.isArray(addresses)
      ? addresses.find((addr) => addr._id === order.shippingAddressId) || null
      : null
  }, [order, addresses])

  // Function to get product details by ID
  const getProductById = (productId) => {
    if (!productId) return null
    return products.find((product) => product._id === productId) || null
  }

  const getCategoryNameById = (categoryId) => {
    if (!categoryId || !Array.isArray(categories)) return 'Uncategorized'
    const category = categories.find((cat) => cat?._id === categoryId)
    if (category) return category.name
  }

  // Get order item details with complete product information
  const getOrderItemDetails = (item) => {
    const product = item.productId?.productName
      ? item.productId
      : getProductById(item.productId?._id || item.productId)
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
        sku:
          product?.sku ||
          item.productId?.sku ||
          item.productId?.productModel ||
          item.sku ||
          'N/A',
        category: categoryName || 'Uncategorized',
      },
      quantity: item.quantity || 1,
      totalPrice:
        (item.quantity || 1) * (item.productId?.price || item.price || 0),
    }
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        // Fetch user's addresses if not already loaded
        if (addresses.length === 0) {
          await dispatch(getAddresses())
        }

        // Fetch products if not already loaded
        if (products.length === 0) {
          await dispatch(fetchProducts({ limit: 1000 }))
        }
        if (categories.length === 0) {
          await dispatch(fetchAllCategories())
        }

        // Fetch order details
        const response = await fetchOrderById(orderId)
        setOrder(response.data)
      } catch (err) {
        console.error('Error loading data:', err)
        setError('Failed to load order details')
      } finally {
        setLoading(false)
      }
    }

    if (orderId) {
      loadData()
    }
  }, [orderId, dispatch, addresses.length, products.length, categories.length])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#BA8B4E]"></div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg max-w-md w-full text-center">
          <p>{error || 'Order not found'}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-[#BA8B4E] text-white rounded-md hover:bg-[#a87d45] transition-colors"
          >
            Back to Orders
          </button>
        </div>
      </div>
    )
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Function to copy order ID to clipboard
  const copyOrderId = async (orderId) => {
    try {
      await navigator.clipboard.writeText(orderId)
      toast.success('Order ID copied to clipboard!')
    } catch (err) {
      toast.error('Failed to copy order ID')
    }
  }

  // Order status tracker configuration
  const getStatusTracker = (currentStatus) => {
    // Handle both ObjectId object and string status
    const statusKey =
      typeof currentStatus === 'object'
        ? currentStatus?.orderStatus
        : currentStatus

    const statusSteps = [
      {
        key: 'pending',
        label: 'Order placed',
        icon: FiShoppingBag,
        description: 'Your order has been received',
      },
      {
        key: 'ready_for_shipment',
        label: 'Order ready for shipment',
        icon: FiPackage,
        description: 'Your order is being prepared',
      },
      {
        key: 'in_shipment',
        label: 'Order in shipment',
        icon: FiTruck,
        description: 'Your order is on the way',
      },
      {
        key: 'completed',
        label: 'Order Delivered',
        icon: FiCheckCircle,
        description: 'Your order has been delivered',
      },
    ]

    const currentIndex = statusSteps.findIndex((step) => step.key === statusKey)

    return statusSteps.map((step, index) => ({
      ...step,
      isActive: index <= currentIndex,
      isCurrent: index === currentIndex,
    }))
  }

  const getStatusBadge = (status) => {
    // Handle both ObjectId object and string status
    const statusKey = typeof status === 'object' ? status?.orderStatus : status

    const statusMap = {
      pending: { bg: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      processing: { bg: 'bg-blue-100 text-blue-800', label: 'Processing' },
      shipped: { bg: 'bg-indigo-100 text-indigo-800', label: 'Shipped' },
      delivered: { bg: 'bg-green-100 text-green-800', label: 'Delivered' },
      cancelled: { bg: 'bg-red-100 text-red-800', label: 'Cancelled' },
    }

    const statusInfo = statusMap[statusKey?.toLowerCase()] || {
      bg: 'bg-gray-100 text-gray-800',
      label: statusKey || status,
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Back button and title */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-[#BA8B4E] hover:text-[#a87d45] mb-4"
          >
            <FiArrowLeft className="mr-2" /> Back to Orders
          </button>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Order Items ({order.products?.length || 0})
            </h1>
            <div className="flex flex-col items-end gap-2 text-right">
              <span className="text-sm text-gray-500">
                Placed on {formatDate(order.createdAt)}
              </span>
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-600 font-mono">
                  ID: {order._id}
                </span>
                <button
                  onClick={() => copyOrderId(order._id)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="Copy order ID"
                >
                  <FiCopy size={14} />
                </button>
              </div>
              {getStatusBadge(order.orderStatus || 'pending')}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <FiPackage className="mr-2 text-[#BA8B4E]" />
                  Order
                </h2>
              </div>
              <div className="divide-y divide-gray-200">
                {order.products?.map((item, index) => {
                  const itemDetails = getOrderItemDetails(item)
                  const product = itemDetails.product
                  return (
                    <div key={index} className="p-6">
                      <div className="flex">
                        <div className="flex-shrink-0 h-24 w-24 rounded-md overflow-hidden border border-gray-200">
                          {product.image ? (
                            <Image
                              src={product.image.thumbnailUrl}
                              alt={product.name || 'Product image'}
                              width={96}
                              height={96}
                              className="w-full h-full object-cover"
                              priority
                            />
                          ) : (
                            <div
                              className="w-full h-full bg-gray-100 flex items-center justify-center"
                              role="img"
                              aria-label="No image available"
                            >
                              <FiPackage className="text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex justify-between">
                            <div>
                              <h3 className="text-base font-medium text-gray-900">
                                <Link
                                  href={`/products/${product._id}`}
                                  className="hover:text-[#BA8B4E] transition-colors"
                                >
                                  {product.name ||
                                    product.productName ||
                                    'Product Name'}
                                </Link>
                              </h3>
                              <p className="mt-1 text-sm text-gray-500">
                                SKU: {product.sku || 'N/A'}
                              </p>
                              {product.category && (
                                <p className="text-sm text-gray-500">
                                  Category:{' '}
                                  {product.category?.name || product.category}
                                </p>
                              )}
                            </div>
                            <p className="text-sm font-medium text-gray-900">
                              ₹{(product.price || 0).toFixed(2)}
                            </p>
                          </div>
                          <div className="mt-2 flex-1 flex items-end justify-between">
                            <p className="text-sm text-gray-500">
                              Qty: {item.quantity || 1}
                            </p>
                            <p className="text-sm font-medium text-gray-900">
                              Total: ₹
                              {(
                                (item.quantity || 1) * (product.price || 0)
                              ).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <FiTruck className="mr-2 text-[#BA8B4E]" />
                  Shipping Information
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Shipping Address
                    </h3>
                    <div className="mt-2 text-sm text-gray-900">
                      <p>{shippingAddress?.fullName}</p>
                      <p>{shippingAddress?.address}</p>
                      <p>
                        {shippingAddress?.city}, {shippingAddress?.state}{' '}
                        {shippingAddress?.zipCode}
                      </p>
                      <p>{shippingAddress?.country || 'India'}</p>
                      <p className="mt-2">
                        <span className="font-medium">Phone:</span>{' '}
                        {shippingAddress?.mobileNo ||
                          user?.phoneNumber ||
                          'N/A'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Shipping Method
                    </h3>
                    <p className="mt-2 text-sm text-gray-900">
                      {order.shippingMethod?.name || 'Standard Shipping'}
                    </p>
                    {order.trackingNumber && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-500">
                          Tracking Number
                        </h4>
                        <p className="text-sm text-[#BA8B4E] font-medium">
                          {order.trackingNumber}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <FiCreditCard className="mr-2 text-[#BA8B4E]" />
                  Payment Information
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Payment Method
                    </h3>
                    <p className="mt-2 text-sm text-gray-900">
                      {order.paymentMethod?.name ||
                        order.paymentMethod ||
                        'Credit/Debit Card'}
                    </p>
                    <h3 className="text-sm font-medium text-gray-500 mt-3">
                      Payment Status
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {order.paymentStatus?.paymentStatus ||
                        order.paymentStatus ||
                        'Paid'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Billing Address
                    </h3>
                    <div className="mt-2 text-sm text-gray-900">
                      <p>{shippingAddress?.fullName || user?.name}</p>
                      <p>{shippingAddress?.address}</p>
                      <p>
                        {shippingAddress?.city}, {shippingAddress?.state}{' '}
                        {shippingAddress?.zipCode}
                      </p>
                      <p>{shippingAddress?.country || 'India'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Status Tracker */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Order Status
                </h2>
              </div>
              <div className="p-6">
                <div className="relative">
                  {getStatusTracker(order.orderStatus || 'pending').map(
                    (step, index) => {
                      const Icon = step.icon
                      return (
                        <div
                          key={step.key}
                          className="flex items-start mb-6 last:mb-0"
                        >
                          <div className="flex flex-col items-center mr-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                step.isActive
                                  ? 'bg-green-500 text-white'
                                  : 'bg-gray-200 text-gray-400'
                              }`}
                            >
                              <Icon size={14} />
                            </div>
                            {index <
                              getStatusTracker(order.orderStatus || 'pending')
                                .length -
                                1 && (
                              <div
                                className={`w-0.5 h-12 mt-2 ${
                                  step.isActive ? 'bg-green-500' : 'bg-gray-200'
                                }`}
                              />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3
                              className={`text-sm font-medium ${
                                step.isActive
                                  ? 'text-gray-900'
                                  : 'text-gray-400'
                              }`}
                            >
                              {step.label}
                            </h3>
                            <p
                              className={`text-xs mt-1 ${
                                step.isActive
                                  ? 'text-gray-600'
                                  : 'text-gray-400'
                              }`}
                            >
                              {step.description}
                            </p>
                          </div>
                        </div>
                      )
                    },
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Order Summary
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Subtotal</span>
                    <span className="text-sm font-medium text-gray-900">
                      ₹{(order.total - (order.shippingCost || 0)).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Shipping</span>
                    <span className="text-sm font-medium text-gray-900">
                      {order.shippingCost === 0
                        ? 'Free'
                        : `₹${order.shippingCost?.toFixed(2) || '0.00'}`}
                    </span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Discount</span>
                      <span className="text-sm font-medium text-red-600">
                        -₹{order.discount?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between">
                      <span className="text-base font-medium text-gray-900">
                        Total
                      </span>
                      <span className="text-base font-bold text-gray-900">
                        ₹{order.total?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Timeline */}
                {/* <div className="mt-8">
                  <h3 className="text-sm font-medium text-gray-500 mb-4">
                    Order Status
                  </h3>
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                    <div className="relative flex items-start pb-6">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#BA8B4E] flex items-center justify-center text-white z-10">
                        <FiCalendar className="w-4 h-4" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">
                          Order Placed
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>

                    {['processing', 'shipped', 'delivered'].includes(
                      order.orderStatus?.toLowerCase(),
                    ) && (
                      <div className="relative flex items-start pb-6">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#BA8B4E] flex items-center justify-center text-white z-10">
                          <FiPackage className="w-4 h-4" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">
                            {order.orderStatus === 'processing'
                              ? 'Processing'
                              : 'Processed'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {order.updatedAt
                              ? formatDate(order.updatedAt)
                              : 'In progress'}
                          </p>
                        </div>
                      </div>
                    )}

                    {['shipped', 'delivered'].includes(
                      order.orderStatus?.toLowerCase(),
                    ) && (
                      <div className="relative flex items-start pb-6">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#BA8B4E] flex items-center justify-center text-white z-10">
                          <FiTruck className="w-4 h-4" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">
                            {order.orderStatus === 'shipped'
                              ? 'Shipped'
                              : 'Shipped'}
                          </p>
                          {order.trackingNumber && (
                            <p className="text-sm text-gray-500">
                              Tracking: {order.trackingNumber}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {order.orderStatus?.toLowerCase() === 'delivered' && (
                      <div className="relative flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#BA8B4E] flex items-center justify-center text-white z-10">
                          <FiMapPin className="w-4 h-4" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">
                            Delivered
                          </p>
                          <p className="text-sm text-gray-500">
                            {order.deliveredAt
                              ? formatDate(order.deliveredAt)
                              : 'Your order has been delivered'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div> */}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              Need Help?
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              If you have any questions about your order, please contact our
              customer service.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center text-sm font-medium text-[#BA8B4E] hover:text-[#a87d45]"
            >
              Contact Us
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
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
