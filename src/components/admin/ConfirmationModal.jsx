import React from 'react'
import ButtonLoader from './ButtonLoader'

const MODAL_THEMES = {
  primary: {
    iconBg: 'bg-sky-100',
    iconText: 'text-sky-600',
    button: 'bg-sky-600 hover:bg-sky-700',
    border: 'border-sky-300',
  },
  warning: {
    iconBg: 'bg-yellow-100',
    iconText: 'text-yellow-600',
    button: 'bg-yellow-600 hover:bg-yellow-700',
    border: 'border-yellow-300',
  },
  error: {
    iconBg: 'bg-red-100',
    iconText: 'text-red-600',
    button: 'bg-red-600 hover:bg-red-700',
    border: 'border-red-300',
  },
  success: {
    iconBg: 'bg-green-100',
    iconText: 'text-green-600',
    button: 'bg-green-600 hover:bg-green-700',
    border: 'border-green-300',
  },
  info: {
    iconBg: 'bg-indigo-100',
    iconText: 'text-indigo-600',
    button: 'bg-indigo-600 hover:bg-indigo-700',
    border: 'border-indigo-300',
  },
}

export default function ConfirmationModal({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  theme = 'primary',
  isLoading = false,
}) {
  if (!open) return null

  const styles = MODAL_THEMES[theme]

  return (
    <div className="fixed top:0 left:0 h-screen md:w-auto md:h-auto md:fixed inset-0 z-50 overflow-hidden flex items-center md:justify-center bg-black/40">
      <div
        className={`w-screen md:w-full max-w-md rounded-lg bg-white shadow-xl border ${styles.border}`}
      >
        <div
          className={
            'flex items-center justify-between p-4 border-b ' + styles.border
          }
        >
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            className="h-5 w-5 text-gray-500 hover:bg-gray-100 rounded"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="p-5 text-gray-700 min-h-32">
          <p>{description}</p>
        </div>

        <div className={'flex justify-end gap-3 p-4 border-t ' + styles.border}>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border text-gray-700 hover:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded text-white disabled:opacity-60 disabled:cursor-not-allowed ${styles.button}`}
            disabled={isLoading}
          >
            {isLoading && <ButtonLoader className={`inline-flex text-white`} />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
