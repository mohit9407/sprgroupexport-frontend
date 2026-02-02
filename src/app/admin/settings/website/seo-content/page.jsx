'use client'

import { AdminInputRow } from '@/components/admin/AdminInputRow'
import AdminTextAreaRow from '@/components/AdminTextAreaRow/AdminTextAreaRow'
import api from '@/lib/axios'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

export default function SeoContentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  const [seoData, setSeoData] = useState({
    id: null,
    title: '',
    metaTag: '',
    keywords: '',
    description: '',
  })

  const getSeoContent = async () => {
    setLoading(true)
    try {
      const resp = await api.get('/seo-content/get-all')
      const seo = resp.data?.[0]
      if (seo) {
        setSeoData({
          id: seo._id,
          title: seo.title || '',
          metaTag: seo.metaTag || '',
          keywords: seo.keywords || '',
          description: seo.description || '',
        })
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to fetch SEO content')
    } finally {
      setLoading(false)
    }
  }

  const updateSeoContent = async () => {
    try {
      await api.put(`/seo-content/update/${seoData.id}`, {
        title: seoData.title,
        metaTag: seoData.metaTag,
        keywords: seoData.keywords,
        description: seoData.description,
      })
      toast.success('SEO content updated successfully')
    } catch (err) {
      console.error(err)
      toast.error('Failed to update SEO content')
    }
  }

  const handleChange = (field) => (e) => {
    setSeoData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }))
  }

  useEffect(() => {
    getSeoContent()
  }, [])

  if (loading) return null

  return (
    <div className="space-y-4">
      <div className="border-b-2 pb-3 border-cyan-400">
        <h2 className="text-lg font-semibold text-gray-800">SEO Content</h2>
      </div>

      <div className="p-6 space-y-6">
        <AdminInputRow
          type="text"
          label="SEO Title"
          placeholder="Enter SEO title"
          value={seoData.title}
          onChange={handleChange('title')}
          helpText="Please enter SEO title."
        />

        <AdminInputRow
          type="text"
          label="SEO Meta-tag"
          placeholder="Enter SEO meta tag"
          value={seoData.metaTag}
          onChange={handleChange('metaTag')}
          helpText="Please enter SEO metatage."
        />

        <AdminInputRow
          type="text"
          label="SEO Keyword"
          placeholder="Enter SEO keywords"
          value={seoData.keywords}
          onChange={handleChange('keywords')}
          helpText="Please enter SEO keyword"
        />

        <AdminTextAreaRow
          label="SEO Description"
          placeholder="Enter SEO description"
          value={seoData.description}
          onChange={handleChange('description')}
          helpText="Please enter SEO description"
          rows={5}
        />

        <div className="flex justify-center gap-4 pt-4">
          <button
            onClick={updateSeoContent}
            className="px-6 py-2 rounded bg-sky-600 text-white font-semibold hover:bg-sky-700"
          >
            Submit
          </button>

          <button
            onClick={() => router.back()}
            className="px-6 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
