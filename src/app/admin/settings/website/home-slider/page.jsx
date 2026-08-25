'use client'

import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useForm, FormProvider } from 'react-hook-form'
import {
  fetchHomeSliders,
  createHomeSliderAsync,
  updateHomeSliderAsync,
  deleteHomeSliderAsync,
  selectHomeSliders,
} from '@/features/home-slider/homeSliderSlice'
import toast from 'react-hot-toast'
import { FormAdminInputRow } from '@/components/admin'
import FileUploadButton from '@/components/admin/FileUploadButton/FileUploadButton'
import { FaPlus, FaTrash } from 'react-icons/fa'

export default function HomeSlider() {
  const dispatch = useDispatch()
  const sliders = useSelector(selectHomeSliders)

  const methods = useForm()

  const [formData, setFormData] = useState([])
  const [selectedMedia, setSelectedMedia] = useState({})

  useEffect(() => {
    dispatch(fetchHomeSliders())
  }, [dispatch])

  useEffect(() => {
    if (sliders?.length) {
      setFormData(sliders)

      const defaultValues = {}
      const initialSelectedMedia = {}
      sliders.forEach((slider, index) => {
        defaultValues[`title-${index}`] = slider.title || ''
        defaultValues[`description-${index}`] = slider.description || ''
        if (slider.sliderImage) {
          initialSelectedMedia[index] = {
            thumbnailUrl: slider.sliderImage,
            largeUrl: slider.sliderImage,
            type: 'image',
          }
        }
        if (slider.sliderVideo) {
          initialSelectedMedia[index] = {
            videoUrl: slider.sliderVideo,
            type: 'video',
          }
        }
      })

      methods.reset(defaultValues)
      setSelectedMedia(initialSelectedMedia)
    }
  }, [sliders, methods])

  const handleMediaSelect = (index, file) => {
    const updated = [...formData]
    const isVideo = file.type.startsWith('video/')
    updated[index] = {
      ...updated[index],
      sliderImage: isVideo ? null : file,
      sliderVideo: isVideo ? file : null,
    }
    setFormData(updated)
  }

  const handleMediaLibrarySelect = (index, selectedMedia) => {
    const updated = [...formData]
    const isVideo =
      selectedMedia.type === 'video' ||
      selectedMedia.mediaType === 'video' ||
      selectedMedia.videoUrl
    updated[index] = {
      ...updated[index],
      sliderImage: isVideo ? null : selectedMedia.largeUrl,
      sliderVideo: isVideo ? selectedMedia.videoUrl : null,
    }
    setFormData(updated)
    setSelectedMedia((prev) => ({ ...prev, [index]: selectedMedia }))
  }

  const handleAddSlider = () => {
    setFormData([
      ...formData,
      { sliderImage: null, sliderVideo: null, title: '', description: '' },
    ])
  }

  const handleRemoveSlider = async (index) => {
    const slider = formData[index]
    if (slider._id) {
      try {
        await dispatch(deleteHomeSliderAsync(slider._id)).unwrap()
        toast.success('Slider deleted successfully')
      } catch (error) {
        toast.error('Failed to delete slider')
        return
      }
    }
    const updated = formData.filter((_, i) => i !== index)
    setFormData(updated)
  }

  const handleSubmit = async (values) => {
    try {
      const promises = formData.map(async (item, index) => {
        const fd = new FormData()

        fd.append('title', values[`title-${index}`] || '')
        fd.append('description', values[`description-${index}`] || '')

        if (item.sliderImage instanceof File) {
          fd.append('sliderImage', item.sliderImage)
        } else if (typeof item.sliderImage === 'string' && item.sliderImage) {
          fd.append('sliderImage', item.sliderImage)
        }

        if (item.sliderVideo instanceof File) {
          fd.append('sliderVideo', item.sliderVideo)
        } else if (typeof item.sliderVideo === 'string' && item.sliderVideo) {
          fd.append('sliderVideo', item.sliderVideo)
        }

        if (item._id) {
          return dispatch(
            updateHomeSliderAsync({
              id: item._id,
              data: fd,
            }),
          ).unwrap()
        } else if (item.sliderImage || item.sliderVideo) {
          return dispatch(createHomeSliderAsync(fd)).unwrap()
        }
      })

      await Promise.all(promises.filter(Boolean))

      toast.success('Home sliders updated successfully')
      dispatch(fetchHomeSliders())
    } catch (error) {
      console.error(error)
      toast.error('Update failed')
    }
  }

  return (
    <FormProvider {...methods}>
      <div className="card">
        <div className="border-b-2 pb-3 border-cyan-400 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">
            Home Page Slider
          </h2>
          <button
            type="button"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
            onClick={handleAddSlider}
          >
            <FaPlus /> Add New Slider
          </button>
        </div>

        <form
          onSubmit={methods.handleSubmit(handleSubmit)}
          className="card-body p-6"
        >
          {formData.map((item, index) => (
            <div
              key={item._id || index}
              className="mb-6 pb-6 border-b border-gray-200 relative"
            >
              <button
                type="button"
                className="absolute top-0 right-0 p-2 text-red-600 hover:bg-red-50 rounded-full"
                onClick={() => handleRemoveSlider(index)}
              >
                <FaTrash />
              </button>

              <div className="grid grid-cols-12 gap-4 items-start mb-4">
                <label className="col-span-12 md:col-span-3 pt-2 text-sm text-right font-bold text-gray-700">
                  Slider Media
                </label>

                <div className="col-span-12 md:col-span-8 space-y-2">
                  <FileUploadButton
                    id={`sliderMedia-${index}`}
                    label={
                      selectedMedia[index] ? 'Change Media' : 'Upload Media'
                    }
                    onChange={(e) =>
                      handleMediaSelect(index, e.target.files?.[0])
                    }
                    selectedItem={selectedMedia[index]}
                    onImageSelect={(media) =>
                      handleMediaLibrarySelect(index, media)
                    }
                    value={
                      item.sliderImage instanceof File ||
                      item.sliderVideo instanceof File
                        ? item.sliderImage?.name || item.sliderVideo?.name
                        : ''
                    }
                    className="w-full"
                    accept="image/*,video/*"
                  />

                  <small className="text-muted block">
                    Choose slider image or video from media or upload new
                    (PNG/JPEG/WEBP/MP4/WEBM/OGG)
                  </small>
                </div>
              </div>

              <FormAdminInputRow
                name={`title-${index}`}
                label="Title"
                placeholder="Enter slider title"
                fullWidth
              />

              <FormAdminInputRow
                name={`description-${index}`}
                label="Description"
                placeholder="Enter slider description"
                fullWidth
              />
            </div>
          ))}

          {formData.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No sliders added yet. Click "Add New Slider" to add one.
            </div>
          )}

          <div className="text-right pt-4">
            <button
              type="submit"
              className="px-6 py-2 rounded bg-sky-600 text-white font-semibold hover:bg-sky-700"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </FormProvider>
  )
}
