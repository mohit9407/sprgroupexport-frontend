'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/axios'
import { toast } from '@/utils/toastConfig'
import { createAdminManualOrder } from '@/features/order/orderService'
import ManualUserFormPage from '@/components/admin/ManualUserPageForm/ManualUserFormPage'
import OrderFormPage from '@/components/admin/ManualUserPageForm/OrderFormPage'

export default function ManualOrderPage() {
  const router = useRouter()

  const [creatingUser, setCreatingUser] = useState(false)
  const [confirmingOrder, setConfirmingOrder] = useState(false)

  const [created, setCreated] = useState({
    userId: '',
    shippingAddressId: '',
    email: '',
  })

  const [userData, setUserData] = useState(null)

  const [activeTab, setActiveTab] = useState('user')

  const [shippingMethods, setShippingMethods] = useState([])
  const [paymentMethods, setPaymentMethods] = useState([])
  const [paymentStatuses, setPaymentStatuses] = useState([])
  const [orderStatuses, setOrderStatuses] = useState([])
  const [productOptions, setProductOptions] = useState([])

  const isUserCreated = Boolean(created.userId)

  const handleExistingUserDetected = ({
    userId,
    shippingAddressId,
    email,
    userData: user,
  }) => {
    if (!userId || !email) return
    setCreated({
      userId: String(userId),
      shippingAddressId: String(shippingAddressId || ''),
      email: String(email),
    })
    setUserData(user)
  }

  const handleClearForm = () => {
    setCreated({
      userId: '',
      shippingAddressId: '',
      email: '',
    })
    setUserData(null)
  }

  useEffect(() => {
    const loadLists = async () => {
      try {
        const [
          shippingRes,
          paymentMethodRes,
          paymentStatusRes,
          orderStatusRes,
          productRes,
        ] = await Promise.all([
          api.get('/shipping/get-all'),
          api.get('/payments/get-all-methods'),
          api.get('/payment-status/get-all'),
          api.get('/order-status/get-all'),
          api.get('/product/get-all-products-with-filters?limit=1000&page=1'),
        ])

        setShippingMethods(shippingRes?.data || shippingRes || [])
        setPaymentMethods(paymentMethodRes?.data || paymentMethodRes || [])
        setPaymentStatuses(paymentStatusRes?.data || paymentStatusRes || [])
        setOrderStatuses(orderStatusRes?.data || orderStatusRes || [])

        const rawProducts =
          productRes?.data?.data || productRes?.data || productRes || []
        setProductOptions(Array.isArray(rawProducts) ? rawProducts : [])
      } catch (e) {
        console.error(e)
      }
    }

    loadLists()
  }, [])

  const shippingMethodOptions = useMemo(
    () =>
      (shippingMethods || []).map((m) => ({
        label: `${m.name}${m.price != null ? ` (₹${m.price})` : ''}`,
        value: m._id,
        price: m.price,
      })),
    [shippingMethods],
  )

  const paymentMethodOptions = useMemo(
    () =>
      (paymentMethods || []).map((m) => ({
        label: m.name,
        value: m._id || m.id,
      })),
    [paymentMethods],
  )

  const paymentStatusOptions = useMemo(
    () =>
      (paymentStatuses || []).map((s) => ({
        label: s.paymentStatus || s.name,
        value: s._id,
      })),
    [paymentStatuses],
  )

  const orderStatusOptions = useMemo(
    () =>
      (orderStatuses || []).map((s) => ({
        label: s.orderStatus || s.name,
        value: s._id,
      })),
    [orderStatuses],
  )

  const productSelectOptions = useMemo(
    () =>
      (productOptions || []).map((p) => ({
        label: `${p.productName || p.name || p.title || p._id}${p.price ? ` (₹${p.price})` : ''}`,
        value: p._id,
        price: p.price,
      })),
    [productOptions],
  )

  const handleCreateUser = async (values) => {
    try {
      setCreatingUser(true)

      const payload = {
        firstName: values?.firstName?.trim() || '',
        lastName: values?.lastName?.trim() || '',
        ...(values?.email?.trim() ? { email: values.email.trim() } : {}),
        ...(values?.mobileNo?.trim()
          ? { mobileNo: values.mobileNo.trim() }
          : {}),
        ...(values?.address
          ? {
              address: {
                ...values.address,
                fullName:
                  values.address.fullName?.trim() ||
                  `${values?.firstName || ''} ${values?.lastName || ''}`.trim(),
                mobileNo:
                  values.address.mobileNo?.trim() ||
                  values?.mobileNo?.trim() ||
                  '',
              },
            }
          : {}),
      }

      const res = await api.post('/auth/admin/manual-user', payload)
      const userId =
        res?.data?.data?.userId || res?.data?.userId || res?.data?._id
      const email = res?.data?.data?.email || res?.data?.email || values?.email
      const shippingAddressId =
        res?.data?.data?.shippingAddressId ||
        res?.data?.shippingAddressId ||
        res?.data?.address?._id

      if (!userId) {
        throw new Error('User ID missing in response')
      }

      // Set the created state with available data
      setCreated({
        userId: String(userId),
        shippingAddressId: shippingAddressId ? String(shippingAddressId) : '',
        email: email || '',
      })

      // Fetch complete user data using email if available
      if (email) {
        try {
          const userRes = await api.get('/auth/admin/get-user-by-email', {
            params: { email },
          })
          console.log('Fetched user data:', userRes?.data)
          setUserData(userRes.data)
        } catch (error) {
          console.error('Failed to fetch user data by email:', error)
          try {
            const userRes = await api.get(`/auth/admin/get-user/${userId}`)
            console.log('Fetched user data by ID:', userRes?.data)
            setUserData(userRes.data)
          } catch (idError) {
            console.error('Failed to fetch user data by ID:', idError)
          }
        }
      }

      toast.success('Manual user created')

      setActiveTab('order')
    } catch (e) {
      console.error('Error creating manual user:', e)
      toast.error(
        e?.response?.data?.message || e?.message || 'Failed to create user',
      )
    } finally {
      setCreatingUser(false)
    }
  }

  const handleConfirmOrder = async (values) => {
    try {
      setConfirmingOrder(true)

      if (!isUserCreated) {
        toast.error('Create user first')
        return
      }

      if (!values.shippingAddressId) {
        toast.error('Please select or add a shipping address')
        return
      }

      const payload = {
        ...values,
        userId: created.userId,
        email: created.email,
        shippingAddressId: values.shippingAddressId,
        onlyAdminComment:
          Array.isArray(values?.onlyAdminComment) &&
          values.onlyAdminComment.length
            ? values.onlyAdminComment
            : [{ message: 'Created by admin (manual order)' }],
      }

      const res = await createAdminManualOrder(payload)
      const createdOrderId = res?._id || res?.data?._id

      toast.success('Order created')
      if (createdOrderId) {
        router.push(`/admin/orders/${createdOrderId}`)
      } else {
        router.push('/admin/orders')
      }
    } catch (e) {
      console.error('Error creating order:', e)
      toast.error(
        e?.response?.data?.message || e?.message || 'Failed to create order',
      )
    } finally {
      setConfirmingOrder(false)
    }
  }

  return (
    <div className="w-full p-6 bg-white rounded shadow">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Manual Create User and Order</h1>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 rounded border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
        >
          Back
        </button>
      </div>

      <div className="border-b-2 pb-3 border-cyan-400 mb-6">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('user')}
            className={`px-4 py-2 rounded-md text-sm font-semibold border transition-colors ${
              activeTab === 'user'
                ? 'bg-cyan-600 text-white border-cyan-600'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            Manual User
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('order')}
            className={`px-4 py-2 rounded-md text-sm font-semibold border transition-colors ${
              activeTab === 'order'
                ? 'bg-cyan-600 text-white border-cyan-600'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            Manual User Order
          </button>
        </div>
      </div>

      <div className={activeTab === 'user' ? 'block' : 'hidden'}>
        <div className="border border-gray-200 rounded p-4">
          <ManualUserFormPage
            mode="add"
            onSubmit={handleCreateUser}
            submitting={creatingUser}
            onExistingUserDetected={handleExistingUserDetected}
            onClearForm={handleClearForm}
          />
        </div>
      </div>

      <div className={activeTab === 'order' ? 'block' : 'hidden'}>
        <div className="border border-gray-200 rounded p-4">
          <OrderFormPage
            mode="add"
            defaultValues={{
              userId: created.userId,
              shippingAddressId: created.shippingAddressId,
              email: created.email || userData?.user?.email || '',
            }}
            userData={userData}
            onSubmit={handleConfirmOrder}
            submitting={confirmingOrder}
            productOptions={productSelectOptions}
            shippingMethodOptions={shippingMethodOptions}
            paymentMethodOptions={paymentMethodOptions}
            paymentStatusOptions={paymentStatusOptions}
            orderStatusOptions={orderStatusOptions}
          />
        </div>
      </div>
    </div>
  )
}
