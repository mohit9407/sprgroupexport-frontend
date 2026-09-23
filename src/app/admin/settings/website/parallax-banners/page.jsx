'use client'

import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useForm, FormProvider } from 'react-hook-form'
import {
  fetchParallaxBanners,
  updateParallaxBannerById,
  selectParallaxBanners,
} from '@/features/parallax-banner/parallaxBannerSlice'
import toast from 'react-hot-toast'
import { FormAdminInputRow } from '@/components/admin'

export default function ParallaxBanners() {
  const dispatch = useDispatch()
  const banners = useSelector(selectParallaxBanners)

  const methods = useForm()

  const [formData, setFormData] = useState([])

  useEffect(() => {
    dispatch(fetchParallaxBanners())
  }, [dispatch])

  useEffect(() => {
    if (banners?.length) {
      setFormData(banners)

      const defaultValues = {}
      banners.forEach((banner, index) => {
        defaultValues[`title-${index}`] = banner.title
        defaultValues[`description-${index}`] = banner.description
      })

      methods.reset(defaultValues)
    }
  }, [banners, methods])

  const handleBannerSelect = (index, file) => {
    const updated = [...formData]
    updated[index] = { ...updated[index], banner: file }
    setFormData(updated)
  }

  const handleSubmit = async (values) => {
    try {
      await Promise.all(
        formData.map((item, index) => {
          const fd = new FormData()

          fd.append('title', values[`title-${index}`] || '')
          fd.append('description', values[`description-${index}`] || '')

          if (item.banner instanceof File) {
            fd.append('banner', item.banner)
          }

          return dispatch(
            updateParallaxBannerById({
              id: item._id,
              data: fd,
            }),
          ).unwrap()
        }),
      )

      toast.success('Parallax banners updated successfully')
    } catch (error) {
      console.error(error)
      toast.error('Update failed')
    }
  }

  return (
    <FormProvider {...methods}>
      <div className="card">
        <div className="border-b-2 pb-3 border-cyan-400">
          <h2 className="text-lg font-semibold text-gray-800">Home Banners</h2>
        </div>

        <form
          onSubmit={methods.handleSubmit(handleSubmit)}
          className="card-body p-6"
        >
          {formData.map((item, index) => (
            <div key={item._id} className="mb-6 pb-6">
              <div className="grid grid-cols-12 gap-4 items-start mb-4">
                <label className="col-span-12 md:col-span-3 pt-2 text-sm text-right font-bold text-gray-700">
                  Banner
                </label>

                <div className="col-span-12 md:col-span-8 space-y-2">
                  <button
                    type="button"
                    className="px-4 py-2 bg-[#004372] text-white rounded hover:bg-[#003451]"
                    onClick={() =>
                      document.getElementById(`bannerUpload-${index}`).click()
                    }
                  >
                    Choose Banner
                  </button>

                  <input
                    id={`bannerUpload-${index}`}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) =>
                      handleBannerSelect(index, e.target.files[0])
                    }
                  />

                  <small className="text-muted block">
                    Choose banner image
                  </small>

                  {item.banner && (
                    <img
                      src={
                        item.banner instanceof File
                          ? URL.createObjectURL(item.banner)
                          : item.banner
                      }
                      alt="banner"
                      className="mt-2 w-36 h-36 border border-gray-300 object-cover"
                    />
                  )}
                </div>
              </div>

              <FormAdminInputRow
                name={`title-${index}`}
                label="Title"
                placeholder="Enter banner title"
                required
                fullWidth
              />

              <FormAdminInputRow
                name={`description-${index}`}
                label="Description"
                placeholder="Enter banner description"
                required
                fullWidth
              />
            </div>
          ))}

          <div className="text-right pt-4">
            <button
              type="submit"
              className="px-6 py-2 rounded bg-[#004372] text-white font-semibold hover:bg-[#003451]"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </FormProvider>
  )
}
