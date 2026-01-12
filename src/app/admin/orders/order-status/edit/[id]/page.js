'use client'

import { useSearchParams, useParams } from 'next/navigation'
import OrderStatusForm from '@/components/admin/orders/order-status/OrderStatusForm'

export default function EditOrderStatusPage() {
  const searchParams = useSearchParams()
  const params = useParams()

  // Get status data from URL search params
  const statusData = {
    statusName: searchParams.get('statusName') || '',
    isDefault: searchParams.get('isDefault') === 'true' ? 'true' : 'false',
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <OrderStatusForm
        mode="edit"
        defaultValues={statusData}
        title="Edit Order Status"
        id={params.id} // Pass the ID from the URL to the form
      />
    </div>
  )
}
