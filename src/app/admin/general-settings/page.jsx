'use client'

import { useEffect } from 'react'
import GeneralSettingFormPage from '@/components/admin/GeneralSettingFormPage/GeneralSettingFormPage'
import {
  clearGeneralSetting,
  getGeneralSetting,
  updateGeneralSetting,
} from '@/features/general-setting/generatSettingSlice'
import { useParams, useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from '@/utils/toastConfig'

function EditGeneralSetting() {
  const params = useParams()
  const router = useRouter()
  const dispatch = useDispatch()

  const {
    data: GeneralSetting,
    status,
    error,
  } = useSelector((state) => state.generalSetting)

  const isLoading = status === 'loading'

  const generalSettingData = Array.isArray(GeneralSetting)
    ? GeneralSetting[0]
    : GeneralSetting

  useEffect(() => {
    dispatch(getGeneralSetting())

    return () => {
      dispatch(clearGeneralSetting())
    }
  }, [dispatch])

  const handleUpdateGeneralSetting = async (values) => {
    try {
      await dispatch(updateGeneralSetting(values)).unwrap()

      toast.success('General setting updated successfully')
      router.push('/admin/general-settings')
    } catch (error) {
      console.error('Update failed:', error)
      toast.error(error?.message || 'Failed to update general setting')
    }
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <GeneralSettingFormPage
      mode="edit"
      defaultValues={generalSettingData}
      onSubmit={handleUpdateGeneralSetting}
    />
  )
}

export default EditGeneralSetting
