'use client'

import { FormProvider, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useRouter } from 'next/navigation'
import * as yup from 'yup'
import { toast } from '@/utils/toastConfig'
import { useDispatch, useSelector } from 'react-redux'
import {
  createContentPage,
  updateContentPage,
} from '@/features/content-page/contentPageSlice'
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css'

import { FormAdminInputRow } from '@/components/admin/AdminInputRow'
import { FormAdminSelect } from '@/components/admin/AdminSelect'

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })

/* ================= SCHEMA ================= */

const pageSchema = yup.object({
  pageSlug: yup.string().required('Page slug is required'),
  pageName: yup.string().required('Page name is required'),
  description: yup.string().required('Description is required'),
  status: yup.boolean().required('Status is required'),
})

/* ================= COMPONENT ================= */

export default function ContentForm({
  mode = 'add',
  defaultValues,
  title = 'Add Page',
  id,
}) {
  const isEditMode = mode === 'edit'
  const router = useRouter()
  const dispatch = useDispatch()

  const { createContentPage: createState, updateContentPage: updateState } =
    useSelector((state) => state.contentPage)

  const isLoading = isEditMode ? updateState.isLoading : createState.isLoading

  const formMethods = useForm({
    resolver: yupResolver(pageSchema),
    defaultValues: {
      pageSlug: defaultValues?.pageSlug || '',
      pageName: defaultValues?.pageName || '',
      description: defaultValues?.description || '',
      // Convert 'active'/'inactive' to boolean for the form
      status:
        defaultValues?.status === undefined
          ? true
          : defaultValues.status === 'active',
    },
    mode: 'onBlur',
  })

  const { handleSubmit, setValue, watch } = formMethods
  const description = watch('description')

  /* ================= SUBMIT ================= */

  const onSubmit = async (values) => {
    try {
      // Prepare payload with correct status format
      const payload = {
        ...values,
        status: values.status ? 'active' : 'inactive',
        htmlDescription: values.description || '', // Ensure htmlDescription is always a string
      }

      if (isEditMode && id) {
        await dispatch(
          updateContentPage({
            id,
            payload,
          }),
        ).unwrap()
        toast.success('Page updated successfully!')
        router.push('/admin/settings/website/content-page')
      } else {
        await dispatch(createContentPage(payload)).unwrap()
        toast.success('Page created successfully!')
        router.push('/admin/settings/website/content-page')
      }
    } catch (error) {
      if (error.includes('Content page already exists')) {
        toast.error(
          'A page with this slug already exists. Please choose a different slug.',
        )
      } else {
        console.error('Error saving page:', error)
        toast.error(
          error?.message ||
            'Failed to save page. Please check the console for details.',
        )
      }
    }
  }

  /* ================= UI ================= */

  return (
    <div className="w-full">
      {/* Header */}
      <div className="border-b border-gray-300 pb-3 mb-6">
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
      </div>

      <FormProvider {...formMethods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-white border border-gray-200 rounded-md shadow-sm p-6">
            {/* Page Slug */}
            <FormAdminInputRow
              name="pageSlug"
              label="Page Slug"
              placeholder="about-us"
              required
              helpText="Please enter page slug with dashes."
            />

            {/* Page Name */}
            <FormAdminInputRow
              name="pageName"
              label="Page Name (English)"
              placeholder="Enter page name"
              required
            />

            {/* Description */}
            <div className="grid grid-cols-12 gap-4 items-start mb-4">
              <label className="col-span-12 md:col-span-3 pt-2 text-sm text-right font-bold text-gray-700">
                Description (English)
                <span className="text-red-600">*</span>
              </label>

              <div className="col-span-12 md:col-span-8">
                <div className="border border-gray-300 rounded overflow-hidden">
                  {typeof window !== 'undefined' && (
                    <ReactQuill
                      theme="snow"
                      value={description}
                      onChange={(value) =>
                        setValue('description', value, {
                          shouldValidate: true,
                        })
                      }
                      className="min-h-50"
                    />
                  )}
                </div>
                <p className="mt-1 text-[11px] text-gray-500">
                  Enter the detailed content of the page
                </p>
              </div>
            </div>

            {/* Status */}
            <FormAdminSelect
              name="status"
              label="Status"
              options={[
                { label: 'Active', value: true },
                { label: 'Inactive', value: false },
              ]}
              //   fullWidth
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-cyan-600 text-white rounded text-sm hover:bg-cyan-700 disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : isEditMode ? 'Update' : 'Submit'}
            </button>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}
