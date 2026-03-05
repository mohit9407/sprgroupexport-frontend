'use client'

import SilverForm from '@/components/admin/SilverFormPage/SilverForm'
import { createSilver } from '@/features/silver/silverSlice'
import { toast } from '@/utils/toastConfig'
import { useRouter } from 'next/navigation'

import React from 'react'
import { useDispatch } from 'react-redux'

export default function AddSilverPage() {
  const router = useRouter()
  const dispatch = useDispatch()

  const handleCreateSilver = async (values) => {
    try {
      await dispatch(createSilver(values)).unwrap()
      toast.success('Silver added successfully')
      router.push('/admin/silver')
    } catch (err) {
      toast.error(err?.message || 'Failed to add silver')
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <SilverForm
        mode="add"
        title="Add New Silver Data"
        onSubmit={handleCreateSilver}
      />
    </div>
  )
}
