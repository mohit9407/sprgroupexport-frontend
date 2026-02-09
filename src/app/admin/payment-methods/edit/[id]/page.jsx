'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'react-hot-toast'
import PaymentMethodForm from '@/components/admin/PaymentMethodForm/PaymentMethodForm'

export default function EditPaymentMethodPage() {
  const searchParams = useSearchParams()
  const [paymentMethod, setPaymentMethod] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const data = searchParams.get('data')
    if (data) {
      try {
        const parsedData = JSON.parse(data)
        setPaymentMethod(parsedData)
      } catch (error) {
        console.error('Error parsing payment method data:', error)
        toast.error('Failed to load payment method data')
      } finally {
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }, [searchParams])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!paymentMethod) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Payment method data not found. Please go back and try again.
        </div>
      </div>
    )
  }

  return <PaymentMethodForm initialData={paymentMethod} isEdit={true} />
}
