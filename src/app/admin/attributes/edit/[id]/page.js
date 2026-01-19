'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAttributeById } from '@/features/attributes/attributesSlice'
import AttributeForm from '@/components/admin/AttributeForm/AttributeForm'
import {
  selectAttributeById,
  selectAttributeStatus,
} from '@/features/attributes/attributesSlice'

export default function EditAttributePage() {
  const { id } = useParams()
  const router = useRouter()
  const dispatch = useDispatch()
  const status = useSelector(selectAttributeStatus)
  const attribute = useSelector((state) => selectAttributeById(state, id))
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (id) {
      dispatch(fetchAttributeById(id)).finally(() => {
        setIsLoading(false)
      })
    }
  }, [id, dispatch])

  if (isLoading || status === 'loading') {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    )
  }

  if (!attribute) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-700">
          Attribute not found
        </h2>
        <button
          onClick={() => router.push('/admin/attributes')}
          className="mt-4 px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700"
        >
          Back to Attributes
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AttributeForm mode="edit" initialData={attribute} />
    </div>
  )
}
