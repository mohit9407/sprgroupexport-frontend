'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import api from '@/lib/axios'

export default function MediaUploadModal({ open, onClose, onNewImagesAdd }) {
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const fileInputRef = useRef(null)

  const resetState = () => {
    files.forEach((f) => URL.revokeObjectURL(f.preview))
    setFiles([])
    setProgress(0)
    setStatus('idle')
    setMessage('')
  }

  const handleClose = () => {
    if (uploading) return
    resetState()
    onClose()
  }

  const addFiles = (fileList) => {
    const existingNames = new Set(files.map((f) => f.file.name))
    const MAX_SIZE = 50 * 1024 * 1024

    const newFiles = Array.from(fileList)
      .filter((file) => !existingNames.has(file.name))
      .map((file) => ({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
        valid: file.size <= MAX_SIZE,
        error: file.size <= MAX_SIZE ? null : 'Invalid file (Max 50MB)',
      }))

    setFiles((prev) => [...prev, ...newFiles])
  }

  const handleDrop = (e) => {
    e.preventDefault()
    if (uploading) return
    addFiles(e.dataTransfer.files)
  }

  const handleUpload = async () => {
    const validFiles = files.filter((f) => f.valid)
    if (!validFiles.length) return

    setUploading(true)
    setProgress(0)
    setStatus('idle')
    setMessage('')

    const formData = new FormData()
    validFiles.forEach((f) => formData.append('images', f.file))

    try {
      await api.post('/media/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            )
            setProgress(percent)
          }
        },
      })

      setStatus('success')
      setMessage('Files uploaded successfully')
      onNewImagesAdd()

      setTimeout(() => {
        handleClose()
      }, 800)
    } catch (err) {
      console.error('Upload error:', err)
      setStatus('error')
      setMessage(
        err?.response?.data?.message || 'Upload failed. Please try again.',
      )
    } finally {
      setUploading(false)
    }
  }

  if (!open) return null

  const validCount = files.filter((f) => f.valid).length
  const canSubmit = validCount > 0 && !uploading

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center"
      onClick={() => !uploading && handleClose()}
    >
      <div
        className="bg-white w-full md:w-[800px] rounded shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="font-semibold text-lg">Add Files</h2>
          <button
            disabled={uploading}
            onClick={handleClose}
            className={`text-xl ${uploading && 'opacity-40 cursor-not-allowed'}`}
          >
            ×
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-[calc(100vh-160px)] overflow-auto">
          <p className="text-sm text-gray-600">
            Click or Drop Images/Videos in the Box for Upload.
          </p>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => !uploading && fileInputRef.current.click()}
            className={`border-2 border-dashed rounded p-4 min-h-[220px]
              flex flex-wrap gap-3 cursor-pointer
              ${uploading && 'pointer-events-none opacity-70'}`}
          >
            {files.length === 0 && (
              <div className="m-auto text-gray-400">
                Drop images/videos here or click to browse
              </div>
            )}

            {files.map((item) => (
              <div
                key={item.id}
                className={`relative w-[140px] h-[140px] border rounded
                  overflow-hidden ${!item.valid && 'opacity-50'}`}
              >
                {item.file.type.startsWith('video/') ? (
                  <video
                    src={item.preview}
                    className="w-full h-full object-contain"
                    muted
                    controls={false}
                  />
                ) : (
                  <Image
                    src={item.preview}
                    alt=""
                    fill
                    className="object-contain"
                  />
                )}

                {!item.valid && (
                  <div
                    className="absolute inset-0 bg-white/80 flex
                                  items-center justify-center text-xs
                                  font-semibold text-red-600 text-center px-2"
                  >
                    {item.error}
                  </div>
                )}
              </div>
            ))}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            hidden
            disabled={uploading}
            onChange={(e) => addFiles(e.target.files)}
          />

          {uploading && (
            <div className="w-full h-2 bg-gray-200 rounded">
              <div
                className="h-2 bg-blue-600 rounded transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {message && (
            <div
              className={`text-sm font-medium
                ${status === 'success' && 'text-green-600'}
                ${status === 'error' && 'text-red-600'}`}
            >
              {message}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 p-4 border-t">
          <button
            disabled={uploading}
            onClick={handleClose}
            className={`px-4 py-2 border rounded
              ${uploading && 'opacity-40 cursor-not-allowed'}`}
          >
            Close
          </button>

          <button
            onClick={handleUpload}
            disabled={!canSubmit}
            className={`px-4 py-2 rounded text-white
              ${canSubmit ? 'bg-blue-600' : 'bg-gray-400'}`}
          >
            {uploading ? 'Uploading...' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  )
}
