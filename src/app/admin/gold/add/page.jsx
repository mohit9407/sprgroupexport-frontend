'use client'

import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { createGold } from '@/features/gold/goldSlice'
import GoldForm from '@/components/admin/goldFormPage/goldFormPage'
import { toast } from 'react-hot-toast'

export default function AddGoldPage() {
  const router = useRouter()
  const dispatch = useDispatch()

  const handleCreateGold = async (values) => {
    try {
      await dispatch(createGold(values)).unwrap()
      toast.success('Gold added successfully')
      router.push('/admin/gold')
    } catch (err) {
      toast.error(err?.message || 'Failed to add gold')
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <GoldForm
        mode="add"
        title="Add New Gold Data"
        onSubmit={handleCreateGold}
      />
    </div>
  )
}
