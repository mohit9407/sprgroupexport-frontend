'use client'

import { FormAdminInputRow, FormAdminSelect } from '@/components/admin'
import { useEffect, useMemo } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAllProduct } from '@/features/products/productsSlice'

export default function InventoryFormPage({
  mode = 'add',
  defaultValues,
  title = 'Add Inventory',
  onSubmit,
}) {
  const isEditMode = mode === 'edit'

  const dispatch = useDispatch()

  const { data: products = [], isLoading } = useSelector(
    (state) => state.products.fetchAllProduct,
  )

  const methods = useForm({
    defaultValues: {
      product: defaultValues?.product ?? defaultValues?._id ?? '',
      stock: defaultValues?.stock ?? 0,
      price: defaultValues?.price ?? 0,
      addedStock: defaultValues?.addedStock,
      purchasePrice: defaultValues?.purchasePrice,
      purchaseCode: defaultValues?.purchaseCode,
      minStockLevel: defaultValues?.minStockLevel,
      maxStockLevel: defaultValues?.maxStockLevel,
    },
  })

  const { reset, setValue, watch, handleSubmit } = methods
  const productId = watch('product')

  useEffect(() => {
    dispatch(fetchAllProduct())
  }, [dispatch])

  useEffect(() => {
    if (!defaultValues) return
    reset(methods.getValues())
  }, [defaultValues, reset])

  useEffect(() => {
    const selected = products.find((p) => p._id === productId)
    setValue('stock', selected?.stock ?? 0)
    setValue('price', selected?.price ?? 0)
  }, [productId, products, setValue])

  const productOptions = useMemo(
    () => [
      {
        label: isLoading ? 'Loading products...' : 'Choose Product',
        value: '',
      },
      ...products.map((p) => ({
        label: p.productName ?? p.sku ?? p._id,
        value: p._id,
      })),
    ],
    [products, isLoading],
  )

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <h2 className="text-lg font-semibold">{title}</h2>
        <hr />

        <FormAdminSelect
          name="product"
          label="Products"
          helpText="Select Products"
          options={productOptions}
        />

        <FormAdminInputRow name="stock" label="Current Stock" readOnly />
        <FormAdminInputRow name="price" label="Total Purchase Price" readOnly />
        <FormAdminInputRow name="addedStock" label="Added Stock" />
        <FormAdminInputRow name="purchasePrice" label="Purchase Price" />
        <FormAdminInputRow name="purchaseCode" label="Purchase Code" />
        <FormAdminInputRow name="minStockLevel" label="Min Stock Level" />
        <FormAdminInputRow name="maxStockLevel" label="Max Stock Level" />

        <div className="flex justify-end">
          <button className="px-6 py-2 bg-cyan-600 text-white rounded">
            {isEditMode ? 'Update' : 'Submit'}
          </button>
        </div>
      </form>
    </FormProvider>
  )
}
