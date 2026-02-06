'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import {
  getGoldById,
  updateGold,
  clearGoldById,
} from '@/features/gold/goldSlice'
import GoldFormPage from '@/components/admin/GoldFormPage/GoldForm'
import { toast } from 'react-hot-toast'

export default function EditGoldPage() {
  const params = useParams()
  const goldId = Array.isArray(params.id) ? params.id[0] : params.id
  const router = useRouter()
  const dispatch = useDispatch()

  const {
    data: gold,
    isLoading,
    error,
  } = useSelector((state) => state.gold.getGoldById)

  useEffect(() => {
    if (!goldId) return

    dispatch(getGoldById(goldId))

    return () => {
      dispatch(clearGoldById())
    }
  }, [dispatch, goldId])

  const handleUpdateGold = async (values) => {
    try {
      await dispatch(
        updateGold({
          id: goldId,
          goldData: values,
        }),
      ).unwrap()

      toast.success('Gold updated successfully')
      router.push('/admin/gold')
    } catch (err) {
      toast.error(err?.message || 'Failed to update gold')
    }
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!gold) return <div>Gold not found</div>

  return (
    <GoldFormPage
      mode="edit"
      goldId={goldId}
      title={`Edit Gold `}
      defaultValues={{
        carat: gold.carat,
        pricePerGram: gold.pricePerGram,
      }}
      onSubmit={handleUpdateGold}
    />
  )
}
