'use client'

import { FormProvider, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { FormAdminInputRow } from '../AdminInputRow'
import { FormAdminSelect } from '../AdminSelect'
import FileUploadButton from '../FileUploadButton/FileUploadButton'
import { useEffect, useState, useRef } from 'react'
import * as yup from 'yup'
import { useRouter } from 'next/navigation'
import { toast } from '@/utils/toastConfig'
import { useDispatch, useSelector } from 'react-redux'
import { getUpdatedObjectFields } from '@/utils/stringUtils'
import {
  createCategory,
  updateCategory,
  fetchAllCategories,
  selectAllCategories,
} from '@/features/categories/categoriesSlice'

const createCategorySchema = (isEdit = false) => {
  return yup.object({
    parentId: yup.string().nullable(),
    name: yup.string().required('Category name is required'),
    image: yup
      .mixed()
      .test('file-or-url', 'Image is required', function (value) {
        // In edit mode, image is not required if we have an existing image
        if (isEdit) return true
        // In add mode, a file is required
        return value && (value instanceof File || value)
      }),
    icon: yup.mixed().test('file-or-url', 'Icon is required', function (value) {
      // In edit mode, icon is not required if we have an existing icon
      if (isEdit) return true
      // In add mode, a file is required
      return value && (value instanceof File || value)
    }),
    status: yup.string().required('Status is required'),
    isEditMode: yup.boolean().default(false),
  })
}

export function CategoryFormPage({
  mode = 'add',
  categoryId,
  defaultValues,
  title,
}) {
  const isEditMode = mode === 'edit'
  const dispatch = useDispatch()
  const router = useRouter()
  const {
    addNewCategory: addNewCategoryData,
    updateCategory: updateCategoryData,
  } = useSelector((state) => state.categories)
  const { data: allCategories = [] } = useSelector(selectAllCategories)

  const [imageFile, setImageFile] = useState(null)
  const [iconFile, setIconFile] = useState(null)
  const [existingImage, setExistingImage] = useState(defaultValues?.image || '')
  const [existingIcon, setExistingIcon] = useState(defaultValues?.icon || '')
  const [parentCategories, setParentCategories] = useState([
    { label: 'No Perent', value: '' },
  ])
  const imageInputRef = useRef(null)
  const iconInputRef = useRef(null)

  const formProviders = useForm({
    resolver: yupResolver(createCategorySchema(isEditMode)),
    defaultValues: {
      parentId: '',
      name: '',
      status: 'active',
      image: null,
      icon: null,
      isEditMode: isEditMode,
      ...defaultValues,
    },
    mode: 'onBlur',
    reValidateMode: 'onChange',
    shouldUnregister: true,
  })

  // Set initial values when defaultValues changes (for edit mode)
  useEffect(() => {
    if (isEditMode && defaultValues) {
      formProviders.reset({
        ...defaultValues,
        isEditMode: true,
        // Ensure we don't set empty strings for files
        image: defaultValues.image || null,
        icon: defaultValues.icon || null,
      })
      if (defaultValues.image) setExistingImage(defaultValues.image)
      if (defaultValues.icon) setExistingIcon(defaultValues.icon)
    }
  }, [isEditMode, defaultValues, formProviders])

  // Fetch all categories when component mounts
  useEffect(() => {
    // Fetch all categories without pagination
    dispatch(fetchAllCategories())
  }, [dispatch])

  // Update parent categories when allCategories changes
  useEffect(() => {
    if (allCategories && allCategories.length > 0) {
      const parentCats = allCategories.map((cat) => ({
        label: cat.name,
        value: cat._id,
      }))

      setParentCategories([{ label: 'No Parent', value: '' }, ...parentCats])
    }
  }, [allCategories])

  const handleFileChange = (field, file) => {
    if (file) {
      if (field === 'image') {
        setImageFile(file)
        setExistingImage(URL.createObjectURL(file))
        formProviders.setValue('image', file, { shouldValidate: true })
      } else {
        setIconFile(file)
        setExistingIcon(URL.createObjectURL(file))
        formProviders.setValue('icon', file, { shouldValidate: true })
      }
    } else {
      // Handle file removal
      if (field === 'image') {
        setImageFile(null)
        setExistingImage('')
        // Only set to null if we're in edit mode and have an existing image
        formProviders.setValue(
          'image',
          isEditMode && defaultValues?.image ? defaultValues.image : null,
          { shouldValidate: true },
        )
      } else {
        setIconFile(null)
        setExistingIcon('')
        // Only set to null if we're in edit mode and have an existing icon
        formProviders.setValue(
          'icon',
          isEditMode && defaultValues?.icon ? defaultValues.icon : null,
          { shouldValidate: true },
        )
      }
    }
  }

  const onSubmit = async (values) => {
    const formData = new FormData()

    // In edit mode, only send changed fields
    if (isEditMode) {
      // Always include the ID for updates
      formData.append('_id', categoryId)

      // Handle name and status
      if (values.name !== defaultValues.name) {
        formData.append('name', values.name)
      }
      if (values.status !== defaultValues.status) {
        formData.append('status', values.status)
      }
      if (values.parentId !== defaultValues.parentId) {
        formData.append('parentId', values.parentId || '')
      }

      // Handle image - only if changed
      if (imageFile instanceof File) {
        formData.append('image', imageFile)
      } else if (!existingImage && values.image === null) {
        // If existing image is being removed
        formData.append('removeImage', 'true')
      }

      // Handle icon - only if changed
      if (iconFile instanceof File) {
        formData.append('icon', iconFile)
      } else if (!existingIcon && values.icon === null) {
        // If existing icon is being removed
        formData.append('removeIcon', 'true')
      }
    } else {
      // In add mode, include all fields except files
      Object.entries(values).forEach(([key, value]) => {
        // Skip isEditMode and file fields (we'll handle them separately)
        if (
          key !== 'isEditMode' &&
          key !== 'image' &&
          key !== 'icon' &&
          value !== null &&
          value !== undefined
        ) {
          formData.append(key, value)
        }
      })

      // Only append files if they are actual File objects
      if (imageFile instanceof File) {
        formData.append('image', imageFile)
      }
      if (iconFile instanceof File) {
        formData.append('icon', iconFile)
      }
    }

    try {
      if (isEditMode) {
        // Make sure to pass both id and data to the updateCategory action
        await dispatch(
          updateCategory({ id: categoryId, data: formData }),
        ).unwrap()
        toast.success('Category updated successfully!')
      } else {
        await dispatch(createCategory(formData)).unwrap()
        toast.success('Category created successfully!')
        router.push('/admin/categories')
      }
    } catch (error) {
      console.error('Error saving category:', error)
      toast.error(error.message || 'Failed to save category')
    }
  }

  const setFieldErrorFromAPI = (errors) => {
    Object.entries(errors).forEach(([field, message]) => {
      formProviders.setError(field, { type: 'manual', message })
    })
  }

  useEffect(() => {
    if (addNewCategoryData?.isError || updateCategoryData?.isError) {
      setFieldErrorFromAPI({
        ...(addNewCategoryData?.message || {}),
        ...(updateCategoryData?.message || {}),
      })
    }
  }, [addNewCategoryData?.isError, updateCategoryData?.isError])

  return (
    <div className="space-y-6">
      <div className="border-b-2 pb-3 border-cyan-400">
        <h2 className="text-lg font-semibold text-gray-800">
          {title || (isEditMode ? 'Edit Category' : 'Add New Category')}
        </h2>
      </div>
      <FormProvider {...formProviders}>
        <form
          onSubmit={formProviders.handleSubmit(onSubmit, console.error)}
          className="max-w-2xl mx-auto"
        >
          <div className="space-y-4">
            <FormAdminSelect
              name="parentId"
              label="Category"
              options={parentCategories}
              helpText="Select perent category or leave as perent"
              fullWidth
            />

            <FormAdminInputRow
              required
              name="name"
              label="Name (English)"
              placeholder="Enter category name in English"
              helpText="Please enter the category name in English"
              fullWidth
            />

            <div className="grid grid-cols-12 gap-4 items-start">
              <label className="col-span-12 md:col-span-3 pt-2 text-sm text-right font-bold text-gray-700">
                Image <span className="text-red-500">*</span>
              </label>
              <div className="col-span-12 md:col-span-9">
                {existingImage && !imageFile && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">Current Image:</p>
                    <img
                      src={existingImage}
                      alt="Current category"
                      className="h-20 w-20 object-cover rounded"
                    />
                  </div>
                )}
                <FileUploadButton
                  id="image-upload"
                  label={existingImage ? 'Change Image' : 'Upload Image'}
                  onChange={(e) =>
                    handleFileChange('image', e.target.files?.[0])
                  }
                  value={formProviders.watch('image')?.name || ''}
                  error={formProviders.formState.errors.image}
                  ref={imageInputRef}
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-12 gap-4 items-start">
              <label className="col-span-12 md:col-span-3 pt-2 text-sm text-right font-bold text-gray-700">
                Icon <span className="text-red-500">*</span>
              </label>
              <div className="col-span-12 md:col-span-9">
                {existingIcon && !iconFile && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">Current Icon:</p>
                    <img
                      src={existingIcon}
                      alt="Current icon"
                      className="h-10 w-10 object-contain"
                    />
                  </div>
                )}
                <FileUploadButton
                  id="icon-upload"
                  label={existingIcon ? 'Change Icon' : 'Upload Icon'}
                  onChange={(e) =>
                    handleFileChange('icon', e.target.files?.[0])
                  }
                  value={formProviders.watch('icon')?.name || ''}
                  error={formProviders.formState.errors.icon}
                  ref={iconInputRef}
                  className="w-full"
                />
              </div>
            </div>

            <FormAdminSelect
              name="status"
              label="Status"
              options={[
                { label: 'Active', value: 'active' },
                { label: 'Inactive', value: 'inactive' },
              ]}
              helpText="Select category status"
              fullWidth
            />
          </div>

          <hr className="my-6 border-gray-300" />

          <div className="flex justify-center space-x-4">
            <button
              type="submit"
              className="px-6 py-2 rounded bg-sky-600 text-white font-semibold hover:bg-sky-700 transition-colors"
              disabled={formProviders.formState.isSubmitting}
            >
              {formProviders.formState.isSubmitting
                ? 'Submitting...'
                : 'Submit'}
            </button>

            <button
              type="button"
              className="px-6 py-2 rounded border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
              onClick={() => router.back()}
              disabled={formProviders.formState.isSubmitting}
            >
              Back
            </button>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}

export default CategoryFormPage
