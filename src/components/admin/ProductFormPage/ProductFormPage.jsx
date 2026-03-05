'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useForm, FormProvider, Controller } from 'react-hook-form'
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
import {
  fetchSilverPrices,
  setSelectedPurity,
} from '@/features/silver/silverSlice'
import AdminInputRow, {
  FormAdminInputRow,
} from '../AdminInputRow/AdminInputRow'
import { FormAdminSelect } from '../AdminSelect/AdminSelect'
import FileUploadButton from '../FileUploadButton/FileUploadButton'
import { buildCategoryTree } from '@/utils/categoryUtils'
import * as yup from 'yup'
import AdminTextAreaRow from '@/components/AdminTextAreaRow/AdminTextAreaRow'
import { HierarchicalCategorySelect } from '@/components/HierarchicalCategoryTree/HierarchicalCategoryTree'

const productSchema = (isGold = false, isSilver = false, isEdit = false) => {
  return yup.object({
    type: yup.string().required('Product type is required'),
    sku: yup.string().required('SKU is required'),
    category: yup.string().required('Category is required'),
    isFeatured: yup.boolean().default(false),
    status: yup.string().required('Status is required'),
    price: yup.number().when([], {
      is: () => !isGold && !isSilver,
      then: (schema) =>
        schema
          .required('Price is required')
          .min(0, 'Price must be greater than or equal to 0'),
      otherwise: (schema) =>
        schema.min(0, 'Price must be greater than or equal to 0'),
    }),
    minOrderLimit: yup
      .number()
      .min(1, 'Minimum order limit must be at least 1')
      .default(1),
    stock: yup
      .number()
      .min(0, 'Stock cannot be negative')
      .required('Stock is required')
      .integer('Stock must be a whole number')
      .default(0),
    productModel: yup.string(),
    carat: yup.string().when([], {
      is: () => isGold,
      then: (schema) => schema.required('Carat is required for gold products'),
      otherwise: (schema) => schema.nullable(),
    }),
    purity: yup.number().when([], {
      is: () => isSilver,
      then: (schema) =>
        schema.required('Purity is required for silver products'),
      otherwise: (schema) =>
        schema
          .nullable()
          .transform((value) =>
            value === '' || value === null ? null : Number(value),
          ),
    }),
    gram: yup.number().when([], {
      is: () => isGold || isSilver,
      then: (schema) =>
        schema
          .required('Grams are required for precious metal products')
          .min(0, 'Grams must be a positive number'),
      otherwise: (schema) =>
        schema.nullable().min(0, 'Grams must be a positive number'),
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
    sideImages: yup
      .array()
      .max(6, 'You can upload maximum 6 side images.')
      .default([]),
    videoEmbedLink: yup.string(),
    productName: yup.string().required('Product name is required'),
    description: yup.string().required('Description is required'),
  })
}

const ProductFormPage = ({ mode = 'add', productId, defaultValues, title }) => {
  const router = useRouter()
  const dispatch = useDispatch()

  const MAX_SIDE_IMAGES = 6

  // Get categories from Redux store
  const { allCategories } = useSelector((state) => state.categories)
  const { status, error } = useSelector((state) => state.products)
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  const [formattedCategories, setFormattedCategories] = useState([])
  const [hierarchicalCategories, setHierarchicalCategories] = useState([])

  // Load categories when component mounts
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoadingCategories(true)

        if (allCategories?.data?.length > 0) {
          const categoriesData = Array.isArray(allCategories.data)
            ? allCategories.data
            : allCategories.data.data || []

          const treeData = buildCategoryTree(categoriesData)

          setHierarchicalCategories(treeData)

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

            const treeData = buildCategoryTree(categoriesData)
            setHierarchicalCategories(treeData)

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
  const [imageFile, setImageFile] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)
  const [existingImage, setExistingImage] = useState(defaultValues?.image || '')
  const [sideImages, setSideImages] = useState(defaultValues?.sideImages || [])
  const [selectedSideImages, setSelectedSideImages] = useState([])
  const [goldPrice, setGoldPrice] = useState(0)
  const isEditMode = mode === 'edit'
  const isInitialMount = useRef(true)
  const imageInputRef = useRef(null)
  const sideImagesInputRef = useRef(null)

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

  // Get silver data from Redux store
  const {
    data: silverData,
    loading: silverLoading,
    error: silverError,
    selectedPurity,
    silverRate,
    calculatedPrice: silverCalculatedPrice,
    isCalculating: silverIsCalculating,
    calculationError: silverCalculationError,
  } = useSelector((state) => {
    return state.silver
  })

  const [isGoldCategory, setIsGoldCategory] = useState(false)
  const [isSilverCategory, setIsSilverCategory] = useState(false)

  const formMethods = useForm({
    resolver: (data, context, options) => {
      const schema = productSchema(isGoldCategory, isSilverCategory, isEditMode)
      return yupResolver(schema)(data, context, options)
    },
    defaultValues: {
      type: 'simple',
      sku: '',
      category: '',
      isFeatured: false,
      status: 'active',
      price: 0,
      minOrderLimit: 1,
      stock: 0,
      productModel: '',
      carat: '',
      gram: 0,
      userExtra: 0,
      color: '',
      size: '',
      image: null,
      sideImages: [],
      videoEmbedLink: '',
      productName: '',
      description: '',
      ...defaultValues,
    },
    mode: 'onBlur',
    reValidateMode: 'onChange',
  })

  const { handleSubmit, watch, setValue, reset, getValues, trigger } =
    formMethods

  // Watch category changes to determine if gold is selected
  const selectedCategory = watch('category')
  const purityValue = watch('purity')
  const selectedGrams = watch('gram')

  // Function to handle gold price calculation
  const handleGoldPriceCalculation = useCallback(
    async (carat, gram) => {
      if (!carat || !gram || gram <= 0) return

      try {
        await dispatch(calculateGoldPrice({ carat, gram })).unwrap()
      } catch (error) {
        console.error('Failed to calculate gold price:', error)
        toast.error('Failed to calculate gold price')
      }
    },
    [dispatch],
  )

  // Function to handle silver price calculation
  const handleSilverPriceCalculation = useCallback(
    (purity, gram) => {
      // Convert to numbers if they're strings
      const purityNum = parseFloat(purity)
      const gramNum = parseFloat(gram)

      if (!purityNum || !gramNum || gramNum <= 0) {
        return
      }

      try {
        const selectedSilver = silverData?.find(
          (item) => item.purity === purityNum,
        )

        if (selectedSilver) {
          const totalPrice = gramNum * selectedSilver.pricePerGram
          setValue('silverPrice', selectedSilver.pricePerGram)
          setValue('price', totalPrice, { shouldValidate: true })
        } else {
          console.log('No silver found for purity:', purityNum)
        }
      } catch (error) {
        console.error('Failed to calculate silver price:', error)
        toast.error('Failed to calculate silver price')
      }
    },
    [silverData, setValue],
  )

  useEffect(() => {
    if (!selectedCategory) {
      setIsGoldCategory(false)
      setIsSilverCategory(false)
      return
    }

    // Recursive search in tree
    const findInTree = (categories, id) => {
      for (const category of categories) {
        if (category._id === id) {
          return category
        }
        if (category.children?.length) {
          const found = findInTree(category.children, id)
          if (found) return found
        }
      }
      return null
    }

    // Function to check if category is under a specific parent in the hierarchy
    const isUnderParentCategory = (category, parentName) => {
      if (!category) return false

      // Check if current category name matches
      if (category.name?.toLowerCase() === parentName.toLowerCase()) {
        return true
      }

      // Check if current category contains the parent name
      if (category.name?.toLowerCase().includes(parentName.toLowerCase())) {
        return true
      }

      // Recursively check parent hierarchy
      const findParent = (categories, childId, path = []) => {
        for (const cat of categories) {
          if (cat._id === childId) {
            return path
          }
          if (cat.children?.length) {
            const result = findParent(cat.children, childId, [...path, cat])
            if (result) return result
          }
        }
        return null
      }

      const parentPath = findParent(hierarchicalCategories, category._id)
      if (parentPath) {
        return parentPath.some(
          (parent) =>
            parent.name?.toLowerCase() === parentName.toLowerCase() ||
            parent.name?.toLowerCase().includes(parentName.toLowerCase()),
        )
      }

      return false
    }

    const selectedCat = findInTree(hierarchicalCategories, selectedCategory)

    // Check if selected category is under gold or silver hierarchy
    const isGold = isUnderParentCategory(selectedCat, 'gold')
    const isSilver = isUnderParentCategory(selectedCat, 'silver')

    // Debug logging
    console.log('Category Detection Debug:', {
      selectedCategoryId: selectedCategory,
      selectedCategoryName: selectedCat?.name,
      isGold,
      isSilver,
      categoryPath: selectedCat
        ? (() => {
            const findParent = (categories, childId, path = []) => {
              for (const cat of categories) {
                if (cat._id === childId) {
                  return path
                }
                if (cat.children?.length) {
                  const result = findParent(cat.children, childId, [
                    ...path,
                    cat,
                  ])
                  if (result) return result
                }
              }
              return null
            }
            return findParent(hierarchicalCategories, selectedCat._id)
          })()
        : null,
    })

    // Also check by ID fallback for silver
    let isSilverByCategory = isSilver
    if (!isSilver && selectedCat) {
      // Check if category ID matches known silver category
      isSilverByCategory =
        selectedCat._id === '69a1405f151d7d78c50eee99' ||
        selectedCat.name === 'Silver' ||
        selectedCat.name === 'silver'
    }

    const finalIsSilver = isSilverByCategory

    setIsGoldCategory(isGold)
    setIsSilverCategory(finalIsSilver)

    // Reset fields when not gold or silver (Add mode only)
    if (!isGold && !finalIsSilver && !isEditMode) {
      setValue('carat', null, { shouldValidate: false })
      setValue('purity', null, { shouldValidate: false })
      setValue('gram', 0)
      setGoldPrice(0)
      setValue('price', 0)
    }

    if (finalIsSilver && !isEditMode) {
      setValue('carat', null, { shouldValidate: false })
      setValue('goldPrice', 0)
    }

    if (isGold && !isEditMode) {
      setValue('purity', null, { shouldValidate: false })
      setValue('silverPrice', 0)

      const currentCarat = getValues('carat')
      if (
        (!currentCarat || currentCarat === null) &&
        caratData &&
        caratData.length > 0
      ) {
        const defaultCarat = caratData[0].carat
        setValue('carat', defaultCarat, { shouldValidate: true })
        dispatch(
          setSelectedCarat({
            carat: caratData[0].carat,
            pricePerGram: caratData[0].pricePerGram,
          }),
        )
      }

      // Set default gram if empty
      const currentGram = getValues('gram')
      if (!currentGram || currentGram === 0 || currentGram === null) {
        setValue('gram', 0, { shouldValidate: false })
      }
    }

    // Edit Mode Price Calculation
    if (isGold && isEditMode && defaultValues?.carat && defaultValues?.gram) {
      handleGoldPriceCalculation(defaultValues.carat, defaultValues.gram)
    }

    if (
      finalIsSilver &&
      isEditMode &&
      defaultValues?.purity &&
      defaultValues?.gram
    ) {
      handleSilverPriceCalculation(defaultValues.purity, defaultValues.gram)
    }
  }, [selectedCategory])

  // Re-validate form when gold/silver category changes
  useEffect(() => {
    if (!isInitialMount.current) {
      // Reset form with updated validation schema
      reset(getValues(), {
        keepValues: true,
        keepDirty: true,
        keepErrors: false,
      })
    }
  }, [isGoldCategory, isSilverCategory, reset, getValues, trigger])

  // Fetch carat data on component mount
  useEffect(() => {
    dispatch(fetchCaratData())
    dispatch(fetchSilverPrices())
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

  // Show error if silver data fails to load
  useEffect(() => {
    if (silverError) {
      toast.error(silverError)
    }
  }, [silverError, silverLoading, silverData])

  // Handle silver price calculation when purity or grams change
  useEffect(() => {
    if (isSilverCategory && purityValue && selectedGrams && selectedGrams > 0) {
      handleSilverPriceCalculation(purityValue, selectedGrams)
    }
  }, [
    isSilverCategory,
    purityValue,
    selectedGrams,
    handleSilverPriceCalculation,
  ])

  useEffect(() => {
    if (isEditMode && defaultValues) {
      reset({
        ...defaultValues,
        isEditMode: true,
        image: defaultValues.image || null,
        sideImages: defaultValues.sideImages || [],
      })
      if (defaultValues.image) setExistingImage(defaultValues.image)
      if (defaultValues.sideImages) {
        setSelectedSideImages(defaultValues.sideImages)
      }

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

  const handleFileChange = (field, file) => {
    if (field === 'image') {
      if (file) {
        // Create a preview URL for the file
        const previewUrl = URL.createObjectURL(file)
        setImageFile(file)
        setSelectedImage({
          name: file.name,
          url: previewUrl,
          type: file.type,
          size: file.size,
        })
        setExistingImage(previewUrl)
        setValue('image', file, { shouldValidate: true })
      } else {
        // Clean up the object URL to avoid memory leaks
        if (existingImage && existingImage.startsWith('blob:')) {
          URL.revokeObjectURL(existingImage)
        }
        setImageFile(null)
        setSelectedImage(null)
        setExistingImage('')
        setValue(
          'image',
          isEditMode && defaultValues?.image ? defaultValues.image : null,
          { shouldValidate: true },
        )
      }
    }
  }

  const handleImageSelect = (image) => {
    setSelectedImage(image)
    setImageFile(null)
    setValue('image', image, { shouldValidate: true })
  }

  const handleSideImagesSelect = (newImages) => {
    // If newImages is a single image, convert it to an array
    const imagesArray = Array.isArray(newImages) ? newImages : [newImages]

    // Combine existing images with new ones, avoiding duplicates
    const updatedImages = [...selectedSideImages]
    imagesArray.forEach((img) => {
      if (updatedImages.length >= MAX_SIDE_IMAGES) return
      if (!updatedImages.some((existingImg) => existingImg._id === img._id)) {
        updatedImages.push(img)
      }
    })

    if (updatedImages.length >= MAX_SIDE_IMAGES && imagesArray.length > 0) {
      const attemptedNewCount = imagesArray.filter(
        (img) =>
          !selectedSideImages.some(
            (existingImg) => existingImg._id === img._id,
          ),
      ).length
      if (selectedSideImages.length + attemptedNewCount > MAX_SIDE_IMAGES) {
        toast.error(`You can upload maximum ${MAX_SIDE_IMAGES} side images.`)
      }
    }

    setSelectedSideImages(updatedImages)
    setValue('sideImages', updatedImages, { shouldValidate: true })
  }

  const removeSideImage = (index) => {
    const updatedSideImages = [...selectedSideImages]
    updatedSideImages.splice(index, 1)
    setSelectedSideImages(updatedSideImages)
    setValue('sideImages', updatedSideImages, { shouldValidate: true })
  }

  const onSubmit = async (data) => {
    setIsLoading(true)
    const formData = new FormData()

    // Determine metalType based on category
    let metalType = null
    if (isGoldCategory) {
      metalType = 'gold'
    } else if (isSilverCategory) {
      metalType = 'silver'
    }

    // Add metalType to data if applicable
    const dataWithMetalType = { ...data }
    if (metalType) {
      dataWithMetalType.metalType = metalType
    }

    if (isEditMode) {
      // Always include the product ID
      formData.append('_id', productId)

      // Include all fields that are present in the form data
      Object.entries(dataWithMetalType).forEach(([key, value]) => {
        // Skip image and sideImages fields as they're handled separately
        if (key === 'image' || key === 'sideImages') return

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

      // Handle main image separately
      if (imageFile instanceof File) {
        formData.append('image', imageFile)
      } else if (selectedImage) {
        // If an image was selected from the media library
        formData.append('image', JSON.stringify(selectedImage))
      } else if (!existingImage && data.image === null) {
        formData.append('removeImage', 'true')
      }

      // Handle side images
      if (selectedSideImages.length > 0) {
        formData.append('sideImages', JSON.stringify(selectedSideImages))
      } else if (data.sideImages && data.sideImages.length === 0) {
        formData.append('removeSideImages', 'true')
      }
    } else {
      // For new product, include all fields
      Object.entries(dataWithMetalType).forEach(([key, value]) => {
        if (
          key !== 'image' &&
          key !== 'sideImages' &&
          value !== null &&
          value !== undefined
        ) {
          if (typeof value === 'object' && !(value instanceof File)) {
            formData.append(key, JSON.stringify(value))
          } else if (typeof value === 'boolean') {
            formData.append(key, value.toString())
          } else {
            formData.append(key, value)
          }
        }
      })

      // Handle main image for new product
      if (imageFile instanceof File) {
        formData.append('image', imageFile)
      } else if (selectedImage) {
        // If an image was selected from the media library
        formData.append('image', JSON.stringify(selectedImage))
      }

      // Handle side images for new product
      if (selectedSideImages.length > 0) {
        formData.append('sideImages', JSON.stringify(selectedSideImages))
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
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <HierarchicalCategorySelect
                categories={hierarchicalCategories}
                value={selectedCategory}
                onChange={(value) =>
                  setValue('category', value, { shouldValidate: true })
                }
                placeholder={
                  isLoadingCategories
                    ? 'Loading categories...'
                    : 'Select a category'
                }
                required
              />
              {formMethods.formState.errors.category && (
                <p className="mt-1 text-sm text-red-600">
                  {formMethods.formState.errors.category.message}
                </p>
              )}
            </div>

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

            {/* Price - Hidden for gold and silver categories */}
            {!isGoldCategory && !isSilverCategory && (
              <FormAdminInputRow
                name="price"
                label="Price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                required={!isGoldCategory && !isSilverCategory}
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
              name="productModel"
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
                  onBlur={async (e) => {
                    const caratValue = e.target.value
                    const gramValue = parseFloat(watch('gram') || 0)
                    if (caratValue && gramValue > 0) {
                      await handleGoldPriceCalculation(caratValue, gramValue)
                    }
                  }}
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
                    }
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
                  onBlur={async (e) => {
                    const gramValue = parseFloat(e.target.value) || 0
                    const caratValue = watch('carat')
                    if (caratValue && gramValue > 0) {
                      await handleGoldPriceCalculation(caratValue, gramValue)
                    }
                  }}
                  onChange={(e) => {
                    const gram = parseFloat(e.target.value) || 0
                    setValue('gram', gram, { shouldValidate: true })
                  }}
                />

                {/* Gold Price (Read-only) */}
                <div>
                  <AdminInputRow
                    label="Gold Price"
                    value={calculatedPrice?.totalPrice?.toFixed(2) || '0.00'}
                    readOnly
                    fullWidth
                    helperText={`${watch('gram') || 0}g × ₹${goldRate || 0}/g`}
                  />
                  <p className="mt-1 text-sm text-gray-500">
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
                    // Add userExtra to total price (silver price + extra)
                    const gramValue = parseFloat(watch('gram') || 0)
                    const purityValue = parseFloat(watch('purity') || 0)
                    if (purityValue && gramValue > 0) {
                      const selectedSilver = silverData?.find(
                        (item) => item.purity === purityValue,
                      )
                      if (selectedSilver) {
                        const basePrice =
                          gramValue * selectedSilver.pricePerGram
                        const totalPrice = basePrice
                        setValue('price', totalPrice, { shouldValidate: true })
                      }
                    }
                  }}
                />
              </>
            )}

            {/* Silver-related fields - Only show when silver category is selected */}
            {isSilverCategory && (
              <>
                {/* Purity */}
                <FormAdminSelect
                  name="purity"
                  label="Purity"
                  options={(() => {
                    if (silverData === null || silverLoading) {
                      return [
                        {
                          label: 'Loading silver data...',
                          value: '',
                          disabled: true,
                        },
                      ]
                    }

                    const options = [
                      { label: 'Select Purity', value: '' },
                      ...(Array.isArray(silverData)
                        ? silverData.map((item) => ({
                            label: `${item.purity}`,
                            value: item.purity,
                            pricePerGram: item.pricePerGram,
                          }))
                        : []),
                    ]
                    return options
                  })()}
                  required={isSilverCategory}
                  fullWidth
                  disabled={silverLoading || silverData === null}
                  onChange={(e) => {
                    const purity = parseFloat(e.target.value)
                    setValue('purity', purity, { shouldValidate: true })
                    dispatch(setSelectedPurity(purity))
                    // Calculate price if grams are already entered
                    const gramValue = parseFloat(watch('gram') || 0)
                    if (purity && gramValue > 0) {
                      handleSilverPriceCalculation(purity, gramValue)
                    }
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
                  required={isSilverCategory}
                  fullWidth
                  onChange={(e) => {
                    const gram = parseFloat(e.target.value) || 0
                    setValue('gram', gram, { shouldValidate: true })
                    // Calculate price if purity is already selected
                    const purityValue = parseFloat(watch('purity') || 0)
                    if (purityValue && gram > 0) {
                      handleSilverPriceCalculation(purityValue, gram)
                    }
                  }}
                />

                {/* Silver Price (Read-only) */}
                <div>
                  <AdminInputRow
                    label="Silver Price"
                    value={watch('price')?.toFixed(2) || '0.00'}
                    readOnly
                    fullWidth
                    helperText={`${watch('gram') || 0}g × ₹${silverRate || 0}/g = ₹${((watch('gram') || 0) * (silverRate || 0)).toFixed(2)}`}
                  />
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
                    // Add userExtra to total price (silver price + extra)
                    const gramValue = parseFloat(watch('gram') || 0)
                    const purityValue = parseFloat(watch('purity') || 0)
                    if (purityValue && gramValue > 0) {
                      const selectedSilver = silverData?.find(
                        (item) => item.purity === purityValue,
                      )
                      if (selectedSilver) {
                        const basePrice =
                          gramValue * selectedSilver.pricePerGram
                        const totalPrice = basePrice
                        setValue('price', totalPrice, {
                          shouldValidate: true,
                        })
                      }
                    }
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
                      src={existingImage.thumbnailUrl}
                      alt="Current product"
                      className="h-32 w-32 object-cover rounded"
                    />
                  </div>
                )}
                <FileUploadButton
                  id="image-upload"
                  label={existingImage ? 'Change Image' : 'Upload Image'}
                  onChange={(e) =>
                    handleFileChange('image', e.target.files?.[0])
                  }
                  selectedItem={selectedImage}
                  onImageSelect={handleImageSelect}
                  value={selectedImage?.name || ''}
                  error={formMethods.formState.errors.image}
                  ref={imageInputRef}
                  className="w-full"
                  accept="image/*"
                />
              </div>
            </div>
            {/* </div> */}

            {/* Side Images */}
            <div className="grid grid-cols-12 gap-4 items-start">
              <label className="col-span-12 md:col-span-3 pt-2 text-sm text-right font-bold text-gray-700">
                Side Images
              </label>
              <div className="col-span-12 md:col-span-9">
                {selectedSideImages?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">
                      Current Side Images:
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {selectedSideImages.map((img, index) => (
                        <div key={index} className="relative group">
                          <div className="relative">
                            <img
                              src={img.thumbnailUrl || img.mediumUrl || img}
                              alt={`Side ${index + 1}`}
                              className="h-24 w-24 object-cover rounded border"
                              onError={(e) => {
                                e.target.onerror = null
                                e.target.src =
                                  img.mediumUrl || img.largeUrl || img
                              }}
                            />
                            {/* Video indicator icon */}
                            {img.type === 'video' && (
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="bg-black/50 rounded-full p-1">
                                  <svg
                                    className="w-4 h-4 text-white"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                  </svg>
                                </div>
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeSideImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs transition-all duration-200"
                            title="Remove image"
                          >
                            ×
                          </button>
                          <span className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs text-center py-0.5">
                            {index + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <FileUploadButton
                  id="side-images-upload"
                  label={
                    selectedSideImages?.length > 0
                      ? 'Add More Images'
                      : 'Add Side Images'
                  }
                  onImageSelect={handleSideImagesSelect}
                  multiSelect={true}
                  selectedItems={selectedSideImages}
                  ref={sideImagesInputRef}
                  className="w-full"
                  accept="image/*,video/*"
                />
                {formMethods.formState.errors?.sideImages?.message && (
                  <span className="mt-1 block text-[11px] text-red-600">
                    {formMethods.formState.errors.sideImages.message}
                  </span>
                )}
              </div>
            </div>

            {/* Video Embed Link */}
            <div className="col-span-2">
              <FormAdminInputRow
                name="videoEmbedLink"
                label="Video Embed Link"
                placeholder="Paste video link here"
                multiline
                rows={4}
                fullWidth
              />
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

              <Controller
                name="description"
                control={formMethods.control}
                render={({ field, fieldState }) => (
                  <AdminTextAreaRow
                    name={field.name}
                    label="Description (English)"
                    placeholder="Enter product description"
                    rows={6}
                    required
                    fullWidth
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={fieldState.error?.message}
                  />
                )}
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
