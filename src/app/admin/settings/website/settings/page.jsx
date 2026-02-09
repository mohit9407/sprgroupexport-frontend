'use client'

import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { AdminInputRow } from '@/components/admin/AdminInputRow'
import AdminTextAreaRow from '@/components/AdminTextAreaRow/AdminTextAreaRow'
import {
  createNewSetting,
  fetchSettings,
  selectAllSettings,
  selectSettingsStatus,
  updateExistingSetting,
} from '@/features/setting/settingSlice'
import api from '@/lib/axios'

export default function SettingsPage() {
  const dispatch = useDispatch()
  const router = useRouter()

  const settings = useSelector(selectAllSettings)
  const status = useSelector(selectSettingsStatus)

  const existingSetting = settings?.[0]

  const [formData, setFormData] = useState({
    siteNameOrLogo: 'logo',
    websiteName: '',
    logo: null,
    favicon: null,
    faceBookLink: '',
    googleLink: '',
    twitterLink: '',
    linkedInLink: '',
    aboutStore: '',
    contactUsDescription: '',
    allowCookies: false,
  })

  useEffect(() => {
    dispatch(fetchSettings())
  }, [dispatch])

  useEffect(() => {
    if (existingSetting) {
      setFormData({
        ...existingSetting,
        logo: existingSetting.logo || null,
        favicon: existingSetting.favicon || null,
      })
    }
  }, [existingSetting])

  const handleChange = (field) => (e) => {
    const value =
      e.target.type === 'checkbox' ? e.target.checked : e.target.value

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleImageSelect = (e, field) => {
    const file = e.target.files[0]
    if (!file) return

    setFormData((prev) => ({
      ...prev,
      [field]: file,
    }))
  }

  const handleSubmit = async () => {
    try {
      const fd = new FormData()

      fd.append('siteNameOrLogo', formData.siteNameOrLogo)
      fd.append('websiteName', formData.websiteName)
      fd.append('faceBookLink', formData.faceBookLink)
      fd.append('googleLink', formData.googleLink)
      fd.append('twitterLink', formData.twitterLink)
      fd.append('linkedInLink', formData.linkedInLink)
      fd.append('aboutStore', formData.aboutStore)
      fd.append('contactUsDescription', formData.contactUsDescription)
      fd.append('allowCookies', formData.allowCookies)

      if (formData.logo instanceof File) {
        fd.append('logo', formData.logo)
      }

      if (formData.favicon instanceof File) {
        fd.append('favicon', formData.favicon)
      }

      await dispatch(
        updateExistingSetting({
          id: existingSetting._id,
          data: fd,
        }),
      ).unwrap()

      toast.success('Settings updated successfully')
    } catch (err) {
      toast.error('Failed to update settings')
    }
  }

  if (status === 'loading') return null

  return (
    <div className="space-y-4">
      <div className="border-b-2 pb-3 border-cyan-400">
        <h2 className="text-lg font-semibold text-gray-800">
          Website Settings
        </h2>
      </div>

      <div className="p-6 space-y-6">
        <AdminInputRow
          label="Show Sitename or Logo"
          type="text"
          placeholder="logo or name"
          value={formData.siteNameOrLogo}
          onChange={handleChange('siteNameOrLogo')}
          helpText="Enter 'logo' or 'name'"
        />

        <AdminInputRow
          label="Website Name"
          placeholder="Enter website name"
          value={formData.websiteName}
          onChange={handleChange('websiteName')}
          helpText="Please enter website name"
        />

        <div className="grid grid-cols-12 gap-4 items-start">
          <label className="col-span-12 md:col-span-3 pt-2 text-sm text-right font-bold text-gray-700">
            Website Logo
          </label>

          <div className="col-span-12 md:col-span-4 space-y-2">
            <button
              type="button"
              className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700"
              onClick={() => document.getElementById('logoUpload').click()}
            >
              Add Image
            </button>

            <input
              id="logoUpload"
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => handleImageSelect(e, 'logo')}
            />

            {formData.logo && (
              <div className="pt-2">
                <p className="text-xs text-gray-500 mb-1">Old Image</p>
                <img
                  src={
                    formData.logo instanceof File
                      ? URL.createObjectURL(formData.logo)
                      : formData.logo
                  }
                  className="h-16 border rounded"
                />
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4 items-start">
          <label className="col-span-12 md:col-span-3 pt-2 text-sm text-right font-bold text-gray-700">
            Favicon
          </label>

          <div className="col-span-12 md:col-span-4 space-y-2">
            <button
              type="button"
              className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700"
              onClick={() => document.getElementById('faviconUpload').click()}
            >
              Add Favicon
            </button>

            <input
              id="faviconUpload"
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => handleImageSelect(e, 'favicon')}
            />

            {formData.favicon && (
              <div className="pt-2">
                <p className="text-xs text-gray-500 mb-1">Old Image</p>
                <img
                  src={
                    formData.favicon instanceof File
                      ? URL.createObjectURL(formData.favicon)
                      : formData.favicon
                  }
                  className="h-10 w-10 border rounded"
                />
              </div>
            )}
          </div>
        </div>

        <AdminInputRow
          label="Facebook URL"
          placeholder="Enter Facebook URL"
          value={formData.faceBookLink}
          onChange={handleChange('faceBookLink')}
          helpText="Please enter facebook url"
        />

        <AdminInputRow
          label="Google URL"
          placeholder="Enter Google URL"
          value={formData.googleLink}
          onChange={handleChange('googleLink')}
          helpText="Please enter google linl"
        />

        <AdminInputRow
          label="Twitter URL"
          placeholder="Enter Twitter URL"
          value={formData.twitterLink}
          onChange={handleChange('twitterLink')}
          helpText="Please enter twitter link"
        />

        <AdminInputRow
          label="LinkedIn URL"
          placeholder="Enter LinkedIn URL"
          value={formData.linkedInLink}
          onChange={handleChange('linkedInLink')}
          helpText="Please enter linkedin link"
        />

        <AdminTextAreaRow
          label="About Store"
          placeholder="Write about your store"
          value={formData.aboutStore}
          onChange={handleChange('aboutStore')}
          rows={4}
          helpText="write about your store"
        />

        <AdminTextAreaRow
          label="Contact Us Description"
          placeholder="Write contact description"
          value={formData.contactUsDescription}
          onChange={handleChange('contactUsDescription')}
          rows={4}
          helpText="write contact description"
        />

        <div className="grid grid-cols-12 gap-4 items-center">
          <label className="col-span-12 md:col-span-3 text-right font-bold text-sm">
            Allow Cookies
          </label>

          <div className="col-span-12 md:col-span-4">
            <input
              type="checkbox"
              checked={formData.allowCookies}
              onChange={handleChange('allowCookies')}
              className="h-4 w-4"
            />
          </div>
        </div>

        <div className="flex justify-center gap-4 pt-6">
          <button
            onClick={handleSubmit}
            className="px-6 py-2 rounded bg-sky-600 text-white font-semibold hover:bg-sky-700"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}
