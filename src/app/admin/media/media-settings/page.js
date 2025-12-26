'use client'

import AdminInputRow from '@/components/AdminInputRow'
import { useState } from 'react'

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
  const [mediaSettings, setMediaSettings] = useState({
    thumbnailHeight: 300,
    thumbnailWidth: 300,
    mediumHeight: 400,
    mediumWidth: 400,
    largeHeight: 900,
    largeWidth: 900,
  })

  const handleOnChange = (ev) => {
    setMediaSettings({
      ...mediaSettings,
      [ev.target.name]: ev.target.value,
    })
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
            value={mediaSettings.thumbnailHeight}
            onChange={handleOnChange}
          />
          <AdminInputRow
            type="number"
            name="thumbnailWidth"
            label="Thumbnail Width"
            placeholder="width"
            helpText="Thumbnail Width"
            value={mediaSettings.thumbnailWidth}
            onChange={handleOnChange}
          />
        </RenderSections>

        <RenderSections title="Medium Setting">
          <AdminInputRow
            type="number"
            name="mediumHeight"
            label="Medium Height"
            placeholder="height"
            helpText="Medium Height"
            value={mediaSettings.mediumHeight}
            onChange={handleOnChange}
          />
          <AdminInputRow
            type="number"
            name="mediumWidth"
            label="Medium Width"
            placeholder="width"
            helpText="Medium Width"
            value={mediaSettings.mediumWidth}
            onChange={handleOnChange}
          />
        </RenderSections>

        <RenderSections title="Large Setting">
          <AdminInputRow
            type="number"
            name="largeHeight"
            label="Large Height"
            placeholder="height"
            helpText="Large Height"
            value={mediaSettings.largeHeight}
            onChange={handleOnChange}
          />
          <AdminInputRow
            type="number"
            name="largeWidth"
            label="Large Width"
            placeholder="width"
            helpText="Large Width"
            value={mediaSettings.largeWidth}
            onChange={handleOnChange}
          />
        </RenderSections>

        <hr className="my-4 border-gray-300" />

        <div className="flex gap-3 pt-4 justify-center">
          <button className="px-5 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700">
            Submit
          </button>

          <button className="px-5 py-2 rounded bg-green-600 text-white font-semibold hover:bg-green-700">
            Save & Regenerate
          </button>

          <button className="px-5 py-2 rounded border border-gray-300 text font-semibold-gray-700 hover:bg-gray-100">
            Back
          </button>
        </div>
      </div>
    </div>
  )
}
