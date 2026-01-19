'use client'

import AttributeForm from '@/components/admin/AttributeForm/AttributeForm'

export default function AddAttributePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <AttributeForm mode="add" />
    </div>
  )
}
