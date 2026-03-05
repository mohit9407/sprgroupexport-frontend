'use client'

import SilverForm from '@/components/admin/SilverFormPage/SilverForm'
import {
  clearSilverById,
  getSilverById,
  updateSilver,
} from '@/features/silver/silverSlice'
import { toast } from '@/utils/toastConfig'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

export default function EditSilverPage() {
  const params = useParams()
  const silverId = Array.isArray(params.id) ? params.id[0] : params.id
  const router = useRouter()
  const dispatch = useDispatch()

  const {
    singleSilver: silver,
    loading,
    error,
  } = useSelector((state) => state.silver)

  useEffect(() => {
    if (!silverId) return

    dispatch(getSilverById(silverId))

    return () => {
      dispatch(clearSilverById())
    }
  }, [dispatch, silverId])

  const handleUpdateSilver = async (values) => {
    try {
      await dispatch(
        updateSilver({
          id: silverId,
          silverData: values,
        }),
      ).unwrap()

      toast.success('Silver updated successfully')
      router.push('/admin/silver')
    } catch (err) {
      toast.error(err?.message || 'Failed to update silver')
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!silver) return <div>Silver not found</div>

  return (
    <SilverForm
      mode="edit"
      silverId={silverId}
      title={`Edit Silver `}
      defaultValues={{
        purity: silver.purity,
        pricePerGram: silver.pricePerGram,
      }}
      onSubmit={handleUpdateSilver}
    />
  )
}
