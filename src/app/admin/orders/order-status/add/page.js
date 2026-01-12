'use client'

import OrderStatusForm from '@/components/admin/orders/order-status/OrderStatusForm'

export default function AddOrderStatusPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <OrderStatusForm mode="add" title="Add New Order Status" />
    </div>
  )
}
