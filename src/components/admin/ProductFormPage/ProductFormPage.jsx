'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from '@/utils/toastConfig'
import { createProduct, updateProduct } from '@/features/products/productsSlice'
import { fetchAllCategories } from '@/features/categories/categoriesSlice'
import {
  fetchCaratData,
  setSelectedCarat,
  selectCaratData,
  calculateGoldPrice,
} from '@/features/carat/caratSlice'
import { FormAdminInputRow } from '../AdminInputRow/AdminInputRow'
import { FormAdminSelect } from '../AdminSelect/AdminSelect'
import FileUploadButton from '../FileUploadButton/FileUploadButton'
import * as yup from 'yup'

const productSchema = (isEdit = false) => {
  return yup.object({
    type: yup.string().required('Product type is required'),
    sku: yup.string().required('SKU is required'),
    category: yup.string().required('Category is required'),
    isFeatured: yup.boolean().default(false),
    status: yup.string().required('Status is required'),
    price: yup
      .number()
      .required('Price is required')
      .min(0, 'Price must be greater than or equal to 0'),
    minOrderLimit: yup
      .number()
      .min(1, 'Minimum order limit must be at least 1')
      .default(1),
    maxOrderLimit: yup
      .number()
      .min(1, 'Maximum order limit must be at least 1')
      .default(10),
    stock: yup
      .number()
      .min(0, 'Stock cannot be negative')
      .required('Stock is required')
      .integer('Stock must be a whole number')
      .default(0),
    model: yup.string(),
    carat: yup.string().when('category', {
      is: 'gold',
      then: (schema) => schema.required('Carat is required for gold products'),
      otherwise: (schema) => schema,
    }),
    gram: yup.number().when('category', {
      is: 'gold',
      then: (schema) =>
        schema
          .required('Grams are required for gold products')
          .min(0, 'Grams must be a positive number'),
      otherwise: (schema) => schema.min(0, 'Grams must be a positive number'),
    }),
    userExtra: yup.number().min(0, 'Extra cost must be a positive number'),
    color: yup.string(),
    size: yup.string(),
    image: yup
      .mixed()
      .test('file-or-url', 'Image is required', function (value) {
        if (isEdit) return true
        return value && (value instanceof File || value)
      }),
    videoEmbedCode: yup.string(),
    isOnSale: yup.boolean().default(false),
    isSpecial: yup.boolean().default(false),
    productName: yup.string().required('Product name is required'),
    description: yup.string().required('Description is required'),
  })
}

const ProductFormPage = ({ mode = 'add', productId, defaultValues, title }) => {
  const router = useRouter()
  const dispatch = useDispatch()

  // Get categories from Redux store
  const { allCategories } = useSelector((state) => state.categories)
  const { status, error } = useSelector((state) => state.products)
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  const [formattedCategories, setFormattedCategories] = useState([])

  // Load categories when component mounts
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoadingCategories(true)

        // First check if we have categories in Redux
        if (allCategories?.data?.length > 0) {
          const categoriesData = Array.isArray(allCategories.data)
            ? allCategories.data
            : allCategories.data.data || []

          const formatted = categoriesData.map((category) => ({
            label: category.name,
            value: category._id,
          }))

          setFormattedCategories(formatted)
        } else {
          // If no categories in Redux, fetch from API
          const response = await dispatch(fetchAllCategories({ limit: 1000 }))
          if (response.payload?.data) {
            const categoriesData = Array.isArray(response.payload.data)
              ? response.payload.data
              : response.payload.data.data || []

            const formatted = categoriesData.map((category) => ({
              label: category.name,
              value: category._id,
            }))

            setFormattedCategories(formatted)
          }
        }
      } catch (error) {
        console.error('Error loading categories:', error)
      } finally {
        setIsLoadingCategories(false)
      }
    }

    loadCategories()
  }, [dispatch, allCategories])

  const [isLoading, setIsLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [existingImage, setExistingImage] = useState(defaultValues?.image || '')
  const [goldPrice, setGoldPrice] = useState(0)
  const isEditMode = mode === 'edit'
  const isInitialMount = useRef(true)

  // Get carat data from Redux store
  const {
    data: caratData,
    loading: caratLoading,
    error: caratError,
    selectedCarat,
    goldRate,
    calculatedPrice,
    isCalculating,
    calculationError,
  } = useSelector(selectCaratData)

  const formMethods = useForm({
    resolver: yupResolver(productSchema(isEditMode)),
    defaultValues: {
      type: 'simple',
      sku: '',
      category: '',
      isFeatured: false,
      status: 'active',
      price: 0,
      minOrderLimit: 1,
      maxOrderLimit: 10,
      stock: 0,
      productModel: '',
      carat: '',
      gram: 0,
      userExtra: 0,
      color: '',
      size: '',
      image: null,
      videoEmbedLink: '',
      flashSale: false,
      special: false,
      productName: '',
      description: '',
      ...defaultValues,
    },
    mode: 'onBlur',
    reValidateMode: 'onChange',
  })

  const { handleSubmit, watch, setValue, reset, getValues } = formMethods

  const [isGoldCategory, setIsGoldCategory] = useState(false)

  // Watch category changes to determine if gold is selected
  const selectedCategory = watch('category')

  // Function to handle gold price calculation
  const handleGoldPriceCalculation = useCallback(
    async (carat, gram) => {
      if (!carat || !gram) return

      // Skip calculation if values haven't changed in edit mode
      if (
        isEditMode &&
        defaultValues?.carat === carat &&
        defaultValues?.gram === parseFloat(gram)
      ) {
        return
      }

      try {
        await dispatch(calculateGoldPrice({ carat, gram })).unwrap()
      } catch (error) {
        console.error('Failed to calculate gold price:', error)
        toast.error('Failed to calculate gold price')
      }
    },
    [dispatch, isEditMode, defaultValues],
  )

  // Watch for changes in carat and gram to calculate price
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if ((name === 'carat' || name === 'gram') && value.carat && value.gram) {
        // Skip if this is the initial render in edit mode
        if (isEditMode && isInitialMount.current) {
          return
        }
        handleGoldPriceCalculation(value.carat, value.gram)
      }
    })
    return () => subscription.unsubscribe()
  }, [watch, handleGoldPriceCalculation, isEditMode])

  useEffect(() => {
    if (selectedCategory) {
      const selectedCategoryObj = formattedCategories.find(
        (cat) => cat.value === selectedCategory,
      )
      const isGold = selectedCategoryObj?.label?.toLowerCase() === 'gold'
      setIsGoldCategory(isGold)

      // Reset gold-related fields if category is changed from gold to non-gold
      if (!isGold) {
        setValue('carat', '')
        setValue('gram', 0)
        setValue('extraCost', 0)
        setGoldPrice(0)
        // Reset price if switching away from gold category
        setValue('price', 0)
      } else if (isEditMode && defaultValues?.carat && defaultValues?.gram) {
        // If editing and it's a gold product, calculate the initial price
        handleGoldPriceCalculation(defaultValues.carat, defaultValues.gram)
      }
    } else {
      setIsGoldCategory(false)
    }
  }, [
    selectedCategory,
    formattedCategories,
    setValue,
    isEditMode,
    defaultValues,
    handleGoldPriceCalculation,
  ])

  // Fetch carat data on component mount
  useEffect(() => {
    dispatch(fetchCaratData())
  }, [dispatch])

  // Set initial carat and gold rate when data is loaded or in edit mode
  useEffect(() => {
    if (caratData === null) return // Data not loaded yet

    if (Array.isArray(caratData) && caratData.length > 0) {
      if (isEditMode && defaultValues?.carat) {
        const carat = caratData.find(
          (item) => item.carat === defaultValues.carat,
        )
        if (carat) {
          dispatch(
            setSelectedCarat({
              carat: carat.carat,
              pricePerGram: carat.pricePerGram,
            }),
          )
          // Only set the value if it's different to prevent re-renders
          if (getValues('carat') !== carat.carat) {
            setValue('carat', carat.carat, { shouldValidate: true })
          }
        }
      } else if (caratData[0] && !isEditMode) {
        // Default to highest carat if not in edit mode
        const highestCarat = caratData[0]
        dispatch(
          setSelectedCarat({
            carat: highestCarat.carat,
            pricePerGram: highestCarat.pricePerGram,
          }),
        )
        setValue('carat', highestCarat.carat, { shouldValidate: true })
      }
    } else if (caratError) {
      toast.error('Failed to load carat data')
    }
  }, [
    caratData,
    isEditMode,
    defaultValues,
    dispatch,
    setValue,
    caratError,
    getValues,
  ])

  // Show error if carat data fails to load
  useEffect(() => {
    if (caratError) {
      toast.error(caratError)
    }
  }, [caratError])

  useEffect(() => {
    if (isEditMode && defaultValues) {
      reset({
        ...defaultValues,
        isEditMode: true,
        image: defaultValues.image || null,
      })
      if (defaultValues.image) setExistingImage(defaultValues.image)

      // Set initial gold price if both carat and gram exist
      if (defaultValues.gram && defaultValues.carat) {
        // Calculate initial price without triggering API call
        const selectedCarat = caratData?.find(
          (item) => item.carat === defaultValues.carat,
        )
        if (selectedCarat) {
          const initialGoldPrice =
            defaultValues.gram * selectedCarat.pricePerGram
          setGoldPrice(initialGoldPrice)
        }
      }
    }

    // Set initial render to false after first render
    if (isInitialMount.current) {
      isInitialMount.current = false
    }
  }, [isEditMode, defaultValues, reset, goldRate, caratData])

  useEffect(() => {
    dispatch(fetchAllCategories())
  }, [dispatch])

  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  const handleImageChange = (file) => {
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setExistingImage(reader.result)
      }
      reader.readAsDataURL(file)
      setValue('image', file, { shouldValidate: true })
    } else {
      setSelectedImage(null)
      setExistingImage('')
      setValue(
        'image',
        isEditMode && defaultValues?.image ? defaultValues.image : null,
        {
          shouldValidate: true,
        },
      )
    }
  }

  const onSubmit = async (data) => {
    setIsLoading(true)
    const formData = new FormData()

    if (isEditMode) {
      // Always include the product ID
      formData.append('_id', productId)

      // Include all fields that are present in the form data
      Object.entries(data).forEach(([key, value]) => {
        // Skip image field as it's handled separately
        if (key === 'image') return

        // Skip null or undefined values
        if (value === null || value === undefined) return

        // Convert boolean values to strings
        if (typeof value === 'boolean') {
          formData.append(key, value.toString())
          return
        }

        // Handle objects (like category)
        if (
          typeof value === 'object' &&
          value !== null &&
          !(value instanceof File)
        ) {
          formData.append(key, JSON.stringify(value))
          return
        }

        // Handle regular values
        formData.append(key, value)
      })

      // Handle image separately
      if (selectedImage instanceof File) {
        formData.append('image', selectedImage)
      } else if (!existingImage && data.image === null) {
        formData.append('removeImage', 'true')
      }
    } else {
      // For new product, include all fields
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'image' && value !== null && value !== undefined) {
          if (typeof value === 'object' && !(value instanceof File)) {
            formData.append(key, JSON.stringify(value))
          } else if (typeof value === 'boolean') {
            formData.append(key, value.toString())
          } else {
            formData.append(key, value)
          }
        }
      })

      if (selectedImage instanceof File) {
        formData.append('image', selectedImage)
      }
    }

    try {
      if (isEditMode) {
        if (!productId) {
          throw new Error('Product ID is missing')
        }
        await dispatch(
          updateProduct({ productId, productData: formData }),
        ).unwrap()
        toast.success('Product updated successfully!')
        router.push('/admin/products')
      } else {
        await dispatch(createProduct(formData)).unwrap()
        toast.success('Product created successfully!')
        router.push('/admin/products')
      }
    } catch (error) {
      console.error('Error saving product:', error)
      toast.error(
        error.message || 'Something went wrong while saving the product',
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{title}</h1>

      <FormProvider {...formMethods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Type */}
            <FormAdminSelect
              name="type"
              label="Product Type"
              options={[
                { label: 'Simple', value: 'simple' },
                { label: 'Variable', value: 'variable' },
                { label: 'External', value: 'external' },
              ]}
              required
              fullWidth
            />

            {/* SKU */}
            <FormAdminInputRow
              name="sku"
              label="Product SKU"
              placeholder="SKU-001"
              required
              fullWidth
            />
            {/* Category */}
            <FormAdminSelect
              name="category"
              label="Category"
              options={formattedCategories}
              placeholder={
                isLoadingCategories
                  ? 'Loading categories...'
                  : 'Select a category'
              }
              isLoading={isLoadingCategories}
              required
              fullWidth
            />

            {/* Featured */}
            <div className="col-span-1 flex items-center ml-[185px]">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={formMethods.watch('isFeatured')}
                  onChange={(e) =>
                    formMethods.setValue('isFeatured', e.target.checked)
                  }
                  className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="isFeatured"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Is Featured
                </label>
              </div>
            </div>

            {/* Status */}
            <FormAdminSelect
              name="status"
              label="Status"
              options={[
                { label: 'Active', value: 'active' },
                { label: 'Inactive', value: 'inactive' },
              ]}
              required
              fullWidth
            />

            {/* Price - Hidden for gold category */}
            {!isGoldCategory && (
              <FormAdminInputRow
                name="price"
                label="Price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                required={!isGoldCategory}
                fullWidth
                startAdornment="$"
              />
            )}

            {/* Min Order Limit */}
            <FormAdminInputRow
              name="minOrderLimit"
              label="Min Order Limit"
              type="number"
              min="1"
              fullWidth
            />

            {/* Max Order Limit */}
            <FormAdminInputRow
              name="maxOrderLimit"
              label="Max Order Limit"
              type="number"
              min="1"
              fullWidth
            />

            {/* Stock */}
            <FormAdminInputRow
              name="stock"
              label="Stock Quantity"
              type="number"
              min="0"
              step="1"
              placeholder="0"
              required
              fullWidth
            />

            {/* Model */}
            <FormAdminInputRow
              name="model"
              label="Model"
              placeholder="Product model"
              fullWidth
            />

            {/* Gold-related fields - Only show when gold category is selected */}
            {isGoldCategory && (
              <>
                {/* Carat */}
                <FormAdminSelect
                  name="carat"
                  label="Carat"
                  options={
                    caratData === null || caratLoading
                      ? [
                          {
                            label: 'Loading carat data...',
                            value: '',
                            disabled: true,
                          },
                        ]
                      : [
                          { label: 'Select Carat', value: '' },
                          ...(Array.isArray(caratData)
                            ? caratData.map((item) => ({
                                label: `${item.carat}K`,
                                value: item.carat,
                                pricePerGram: item.pricePerGram,
                              }))
                            : []),
                        ]
                  }
                  required={isGoldCategory}
                  fullWidth
                  disabled={caratLoading || caratData === null}
                  onChange={(e) => {
                    const carat = caratData?.find(
                      (item) => item.carat === e.target.value,
                    )
                    if (carat) {
                      dispatch(
                        setSelectedCarat({
                          carat: carat.carat,
                          pricePerGram: carat.pricePerGram,
                        }),
                      )
                      // Update gold price when carat changes
                      const gram = parseFloat(watch('gram') || 0)
                      setGoldPrice(gram * carat.pricePerGram)
                    }
                    setValue('carat', e.target.value, { shouldValidate: true })
                  }}
                />

                {/* Grams */}
                <FormAdminInputRow
                  name="gram"
                  label="Grams"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  required={isGoldCategory}
                  fullWidth
                  onChange={(e) => {
                    const gram = parseFloat(e.target.value) || 0
                    setValue('gram', gram, { shouldValidate: true })

                    // Update gold price when gram change
                    const selectedCaratValue = watch('carat')
                    const carat = caratData?.find(
                      (item) => item.carat === selectedCaratValue,
                    )
                    if (carat) {
                      const newGoldPrice = gram * carat.pricePerGram
                      setGoldPrice(newGoldPrice)

                      // Update total price (gold price + extra cost)
                      const extraCost = parseFloat(watch('extraCost') || 0)
                      setValue('price', newGoldPrice + extraCost, {
                        shouldValidate: true,
                      })
                    }
                  }}
                />

                {/* Gold Price (Read-only) */}
                <div>
                  <FormAdminInputRow
                    name="goldPrice"
                    label="Gold Price"
                    value={calculatedPrice?.totalPrice?.toFixed(2) || '0.00'}
                    readOnly
                    fullWidth
                    startAdornment="₹"
                    className="bg-gray-100"
                  />
                  <p className="mt-1 text-xs text-gray-500 ml-[185px]">
                    {isCalculating ? (
                      'Calculating...'
                    ) : calculationError ? (
                      <span className="text-red-500">
                        Error calculating price
                      </span>
                    ) : calculatedPrice ? (
                      `Calculated: ${calculatedPrice.gram}g × ₹${calculatedPrice.pricePerGram?.toLocaleString('en-IN')}/g`
                    ) : caratLoading || caratData === null ? (
                      'Loading carat data...'
                    ) : caratError ? (
                      'Error loading carat data'
                    ) : (
                      'Enter carat and gram to calculate'
                    )}
                  </p>
                </div>

                {/* Extra Cost */}
                <FormAdminInputRow
                  name="userExtra"
                  label="Extra Cost"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  fullWidth
                  startAdornment="$"
                  onChange={(e) => {
                    const userExtra = parseFloat(e.target.value) || 0
                    setValue('userExtra', userExtra, { shouldValidate: true })
                    // Update total price (gold price + extra cost)
                    const goldPrice = calculatedPrice?.totalPrice || 0
                    setValue('price', goldPrice + userExtra, {
                      shouldValidate: true,
                    })
                  }}
                />
              </>
            )}

            {/* Color */}
            <FormAdminInputRow
              name="color"
              label="Color"
              placeholder="e.g., Yellow, White, Rose"
              fullWidth
            />

            {/* Size */}
            <FormAdminInputRow
              name="size"
              label="Size"
              placeholder="e.g., Small, Medium, Large"
              fullWidth
            />

            {/* Product Image */}
            {/* <div className="col-span-1 md:col-span-2"> */}
            <div className="grid grid-cols-12 gap-4 items-start">
              <label className="col-span-12 md:col-span-3 pt-2 text-sm text-right font-bold text-gray-700">
                Product Image <span className="text-red-500">*</span>
              </label>
              <div className="col-span-12 md:col-span-9">
                {existingImage && !selectedImage && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">Current Image:</p>
                    <img
                      src={existingImage}
                      alt="Current product"
                      className="h-32 w-32 object-cover rounded"
                    />
                  </div>
                )}
                <FileUploadButton
                  id="image-upload"
                  label={existingImage ? 'Change Image' : 'Upload Image'}
                  onChange={(e) => handleImageChange(e.target.files?.[0])}
                  accept="image/*"
                  error={formMethods.formState.errors.image}
                  className="w-full"
                />
              </div>
            </div>
            {/* </div> */}

            {/* Video Embed Code */}
            <div className="col-span-2">
              <FormAdminInputRow
                name="videoEmbedCode"
                label="Video Embed Code"
                placeholder="Paste video embed code here"
                multiline
                rows={3}
                fullWidth
              />
            </div>

            {/* Flash Sale */}
            <div className="col-span-1 flex items-center ml-[185px]">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isOnSale"
                  checked={formMethods.watch('isOnSale')}
                  onChange={(e) =>
                    formMethods.setValue('isOnSale', e.target.checked)
                  }
                  className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="isOnSale"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Flash Sale
                </label>
              </div>
            </div>

            {/* Special */}
            <div className="col-span-1 flex items-center ml-[185px]">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isSpecial"
                  checked={formMethods.watch('isSpecial')}
                  onChange={(e) =>
                    formMethods.setValue('isSpecial', e.target.checked)
                  }
                  className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="isSpecial"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Special
                </label>
              </div>
            </div>
          </div>

          {/* Product Information */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Product Information
            </h3>
            <div className="grid grid-cols-1 gap-6">
              <FormAdminInputRow
                name="productName"
                label="Product Name (English)"
                placeholder="Enter product name"
                required
                fullWidth
              />

              <FormAdminInputRow
                name="description"
                label="Description (English)"
                placeholder="Enter product description"
                multiline
                rows={4}
                required
                fullWidth
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-5 border-t border-gray-200">
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.push('/admin/products')}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || status === 'loading'}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md bg-sky-600 text-white hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading || status === 'loading' ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {mode === 'add' ? 'Creating...' : 'Updating...'}
                  </>
                ) : mode === 'add' ? (
                  'Create Product'
                ) : (
                  'Update Product'
                )}
              </button>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}

export default ProductFormPage
