'use client'

import { AdminInputRow } from '@/components/admin/AdminInputRow'
import api from '@/lib/axios'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

const RenderSections = ({ title, children }) => {
  return (
    <div>
      <h3 className="text-md font-medium text-gray-700">{title}</h3>
      <hr className="my-4 border-gray-300" />
      <div className="space-y-4">{children}</div>
    </div>
  )
}

export default function MediaSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [mediaSettings, setMediaSettings] = useState({
    id: null,
    thumbnail: { width: 150, height: 150 },
    medium: { width: 400, height: 400 },
    large: { width: 900, height: 900 },
  })

  const getMediaSettings = async () => {
    setLoading(true)
    try {
      const resp = await api.get('/media-settings/get-settings')
      const { _id, thumbnail, medium, large } = resp.data
      setMediaSettings({ id: _id, thumbnail, medium, large })
    } catch (e) {
      console.error('Get Media Settings: ', e)
    } finally {
      setLoading(false)
    }
  }

  const updateMediaSettings = async () => {
    setLoading(true)
    try {
      await api.put(
        `/media-settings/update-settings/${mediaSettings?.id}`,
        mediaSettings,
      )
      toast.success('Media settings saved successfully')
      await getMediaSettings()
    } catch (e) {
      console.error('Update Media Settings: ', e)
      toast.success('Error updating media settings')
    } finally {
      setLoading(false)
    }
  }

  const handleOnChange = (section, field) => (e) => {
    setMediaSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: Number(e.target.value),
      },
    }))
  }

  const goBack = () => {
    router.back()
  }

  useEffect(() => {
    getMediaSettings()
  }, [])

  if (!mediaSettings || loading) {
    return
  }

  return (
    <div className="space-y-3">
      <div className="border-b-2 pb-3 border-cyan-400">
        <h2 className="text-lg font-semibold text-gray-800">Image Size</h2>
      </div>

      <div className="p-6 space-y-10">
        <RenderSections title="Thumbnail Setting">
          <AdminInputRow
            type="number"
            name="thumbnailHeight"
            label="Thumbnail Height"
            placeholder="height"
            helpText="Thumbnail Height"
            value={mediaSettings.thumbnail.height}
            onChange={handleOnChange('thumbnail', 'height')}
          />
          <AdminInputRow
            type="number"
            name="thumbnailWidth"
            label="Thumbnail Width"
            placeholder="width"
            helpText="Thumbnail Width"
            value={mediaSettings.thumbnail.width}
            onChange={handleOnChange('thumbnail', 'width')}
          />
        </RenderSections>

        <RenderSections title="Medium Setting">
          <AdminInputRow
            type="number"
            name="mediumHeight"
            label="Medium Height"
            placeholder="height"
            helpText="Medium Height"
            value={mediaSettings.medium.height}
            onChange={handleOnChange('medium', 'height')}
          />
          <AdminInputRow
            type="number"
            name="mediumWidth"
            label="Medium Width"
            placeholder="width"
            helpText="Medium Width"
            value={mediaSettings.medium.width}
            onChange={handleOnChange('medium', 'width')}
          />
        </RenderSections>

        <RenderSections title="Large Setting">
          <AdminInputRow
            type="number"
            name="largeHeight"
            label="Large Height"
            placeholder="height"
            helpText="Large Height"
            value={mediaSettings.large.height}
            onChange={handleOnChange('large', 'height')}
          />
          <AdminInputRow
            type="number"
            name="largeWidth"
            label="Large Width"
            placeholder="width"
            helpText="Large Width"
            value={mediaSettings.large.width}
            onChange={handleOnChange('large', 'width')}
          />
        </RenderSections>

        <hr className="my-4 border-gray-300" />

        <div className="flex gap-3 pt-4 justify-center">
          <button
            className="px-5 py-2 rounded bg-sky-600 text-white font-semibold hover:bg-sky-700"
            onClick={updateMediaSettings}
          >
            Submit
          </button>

          {/* TODO: Need API for Save & Regenerate */}
          <button
            className="px-5 py-2 rounded bg-green-600 text-white font-semibold hover:bg-green-700"
            onClick={updateMediaSettings}
          >
            Save & Regenerate
          </button>

          <button
            className="px-5 py-2 rounded border border-gray-300 text font-semibold-gray-700 hover:bg-gray-100"
            onClick={goBack}
          >
            Back
          </button>
        </div>
      </div>
    </div>
  )
}
