'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  getOrderDetails,
  updateOrderStatus,
} from '@/features/order/orderService'
import { fetchProductById } from '@/features/products/productService'
import { toast } from '@/utils/toastConfig'
import api from '@/lib/axios'
import OrderInformation from '@/components/admin/orders/order-page/OrderInformation'
import CustomerInformation from '@/components/admin/orders/order-page/CustomerInformation'
import OrderItems from '@/components/admin/orders/order-page/OrderItems'
import StatusUpdateForm from '@/components/admin/orders/order-page/UpdateStatusForm'
import StatusHistory from '@/components/admin/orders/order-page/StatusHistory'

export default function OrderDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [status, setStatus] = useState('')
  const [comment, setComment] = useState('')
  const [statusHistory, setStatusHistory] = useState([])
  const [shippingAddress, setShippingAddress] = useState(null)
  const [orderStatus, setOrderStatus] = useState(null)
  const [products, setProducts] = useState([])
  const [loadingDetails, setLoadingDetails] = useState({
    shippingAddress: true,
    orderStatus: true,
    products: true,
  })

  // Fetch additional order details
  const fetchOrderDetails = async (orderData) => {
    try {
      // Fetch order status
      if (orderData.orderStatus) {
        try {
          const statusResponse = await api.get(
            `/order-status/${orderData.orderStatus}`,
          )
          setOrderStatus(statusResponse.data.orderStatus)
        } catch (err) {
          console.error('Error fetching order status:', err)
        }
      }

      // Fetch shipping address
      if (orderData.shippingAddressId) {
        try {
          const addressResponse = await api.get(
            `/auth/admin/${orderData.user._id}/${orderData.shippingAddressId}`,
          )
          setShippingAddress(addressResponse.data)
        } catch (err) {
          console.error('Error fetching shipping address:', err)
        }
      }
    } catch (error) {
      console.error('Error in fetchOrderDetails:', error)
    } finally {
      setLoadingDetails((prev) => ({
        ...prev,
        shippingAddress: false,
        orderStatus: false,
      }))
    }
  }

  useEffect(() => {
    // Fetch product details for each item in the order
    const fetchProducts = async (items) => {
      try {
        const productPromises = items.map((item) =>
          fetchProductById(item.productId)
            .then((response) => {
              const productData = response?.data || response
              return {
                _id: productData._id || item.productId,
                name: productData.productName || 'Product',
                salePrice: productData.price || 0,
                sku: productData.sku || '',
                images: [
                  productData.image,
                  ...(productData.sideImages?.map((si) => si.url) || []),
                ].filter(Boolean),
                variants: {
                  ...(productData.productDetails?.materialType && {
                    Material: productData.productDetails.materialType,
                  }),
                  ...(productData.productDetails?.metalType && {
                    Metal: productData.productDetails.metalType,
                  }),
                },
                quantity: item.quantity,
                orderItemId: item._id,
              }
            })
            .catch((err) => {
              console.error(`Error fetching product ${item.productId}:`, err)
              return {
                _id: item.productId,
                name: 'Product not found',
                salePrice: 0,
                sku: '',
                images: ['/images/placeholder-product.png'],
                variants: {},
                quantity: item.quantity,
                orderItemId: item._id,
              }
            }),
        )

        const productsData = await Promise.all(productPromises)
        setProducts(productsData)
      } catch (error) {
        console.error('Error fetching products:', error)
        setProducts([])
      } finally {
        setLoadingDetails((prev) => ({
          ...prev,
          products: false,
        }))
      }
    }

    const fetchOrder = async () => {
      try {
        setLoading(true)
        const response = await getOrderDetails(id)
        const data = response.data

        // Format order data
        const formattedOrder = {
          ...data,
          orderId: data._id || data.orderId,
          orderDate: data.createdAt || new Date().toISOString(),
          customer: data.user
            ? {
                name:
                  `${data.user.firstName || ''} ${data.user.lastName || ''}`.trim() ||
                  'Guest',
                email: data.user.email || '',
                phone: data.user.phone || '',
              }
            : {
                name: 'Guest',
                email: data.shippingAddress?.email || '',
                phone: data.shippingAddress?.phone || '',
              },
          subtotal: data.subtotal || 0,
          tax: data.tax || 0,
          shipping: data.shippingCost || 0,
          total: data.total || 0,
          status: orderStatus || data.status || 'Pending',
          statusHistory: data.statusHistory || [
            {
              date: data.createdAt || new Date().toISOString(),
              status: data.status || 'Pending',
              comment: 'Order placed',
            },
          ],
          originalData: data,
        }

        setOrder(formattedOrder)
        setStatus(data.status || 'Pending')
        setStatusHistory(
          data.statusHistory || [
            {
              date: data.createdAt || new Date().toISOString(),
              status: data.status || 'Pending',
              comment: 'Order placed',
            },
          ],
        )

        // Fetch product details for each item
        if (data.products && data.products.length > 0) {
          fetchProducts(data.products)
        } else {
          setLoadingDetails((prev) => ({
            ...prev,
            products: false,
          }))
        }

        // Fetch additional order details
        fetchOrderDetails(data)
      } catch (err) {
        console.error('Error fetching order:', err)
        setError(err.message || 'Failed to load order details')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchOrder()
    }
  }, [id, orderStatus])

  const handleStatusUpdate = async (e) => {
    e.preventDefault()

    try {
      // Call the updateOrderStatus API with status ID
      await updateOrderStatus(id, { id: status, comment })

      // Update local state
      const newStatusEntry = {
        date: new Date().toISOString(),
        status,
        comment: comment || 'Status updated',
      }

      const updatedStatusHistory = [newStatusEntry, ...statusHistory]

      setStatusHistory(updatedStatusHistory)
      setOrder((prevOrder) => ({
        ...prevOrder,
        status,
        statusHistory: updatedStatusHistory,
      }))

      toast.success('Order status updated successfully')
      setComment('')
    } catch (err) {
      console.error('Error updating status:', err)
      toast.error(err.message || 'Failed to update order status')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-semibold text-gray-700">
          Order not found
        </h2>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Order #{order.orderId}</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Print
          </button>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Back to Orders
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Order details */}
        <div className="lg:col-span-2 space-y-6">
          <OrderInformation
            order={order}
            orderStatus={orderStatus}
            loadingDetails={loadingDetails}
            shippingAddress={shippingAddress}
          />
          <CustomerInformation
            order={order}
            shippingAddress={shippingAddress}
          />
          <OrderItems
            loadingDetails={loadingDetails}
            products={products}
            order={order}
          />
        </div>

        {/* Right column - Status update and history */}
        <div className="space-y-6">
          <StatusUpdateForm
            status={status}
            setStatus={setStatus}
            comment={comment}
            setComment={setComment}
            handleStatusUpdate={handleStatusUpdate}
            router={router}
          />
          <StatusHistory statusHistory={statusHistory} />
        </div>
      </div>
    </div>
  )
}
