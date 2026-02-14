'use client'

import ContentForm from '@/components/admin/ContentPageForm/ContentForm'

export default function AddContentPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <ContentForm mode="add" title="Add New Page" />
    </div>
  )
}
