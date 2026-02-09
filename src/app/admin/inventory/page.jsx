'use client'

import InventoryFormPage from '@/components/admin/InventoryFormPage/InventoryForm'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { fetchAllProduct } from '@/features/products/productsSlice'
import { applyInventory } from '@/features/inventory/inventorySlice'
import { toast } from '@/utils/toastConfig'

function EditInventory() {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchAllProduct())
  }, [dispatch])

  const handleSubmitInventory = async (values) => {
    const payload = {
      product: values.product,
      addedStock:
        values.addedStock !== undefined ? Number(values.addedStock) : undefined,
      purchasePrice:
        values.purchasePrice !== undefined
          ? Number(values.purchasePrice)
          : undefined,
      purchaseCode: values.purchaseCode || undefined,
      minStockLevel:
        values.minStockLevel !== undefined
          ? Number(values.minStockLevel)
          : undefined,
      maxStockLevel:
        values.maxStockLevel !== undefined
          ? Number(values.maxStockLevel)
          : undefined,
    }

    const action = await dispatch(applyInventory(payload))
    if (!applyInventory.rejected.match(action)) {
      dispatch(fetchAllProduct())
      toast.success('Updated successfully')
    } else {
      toast.error(action.payload || 'Failed to apply inventory')
    }
  }

  return <InventoryFormPage mode="add" onSubmit={handleSubmitInventory} />
}

export default EditInventory
