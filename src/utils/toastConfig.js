import hotToast, { Toaster as HotToaster } from 'react-hot-toast'

export const toast = {
  success: (message, options = {}) => {
    return hotToast.success(message, {
      position: 'top-right',
      duration: 2000,
      style: {
        borderRadius: '8px',
        background: '#333',
        color: '#fff',
        border: '1px solid #4CAF50',
        padding: '12px 16px',
        fontSize: '14px',
      },
      ...options,
    })
  },
  error: (message, options = {}) => {
    return hotToast.error(message, {
      position: 'top-right',
      duration: 3000,
      style: {
        borderRadius: '8px',
        background: '#FEE2E2',
        color: '#B91C1C',
        border: '1px solid #FCA5A5',
        padding: '12px 16px',
        fontSize: '14px',
      },
      ...options,
    })
  },
  info: (message, options = {}) => {
    return hotToast(message, {
      position: 'top-right',
      duration: 2000,
      style: {
        borderRadius: '8px',
        background: '#EFF6FF',
        color: '#1E40AF',
        border: '1px solid #93C5FD',
        padding: '12px 16px',
        fontSize: '14px',
      },
      ...options,
    })
  },
  loading: (message, options = {}) => {
    return hotToast.loading(message, {
      position: 'top-right',
      style: {
        borderRadius: '8px',
        background: '#333',
        color: '#fff',
        padding: '12px 16px',
        fontSize: '14px',
      },
      ...options,
    })
  },
  dismiss: hotToast.dismiss,
  remove: hotToast.remove,
}

// Re-export the Toaster component with default options
export const Toaster = () => (
  <HotToaster
    position="top-right"
    toastOptions={{
      duration: 2000,
      style: {
        borderRadius: '8px',
        background: '#333',
        color: '#fff',
        padding: '12px 16px',
        fontSize: '14px',
      },
      success: {
        style: {
          background: '#DCFCE7',
          color: '#166534',
          border: '1px solid #86EFAC',
        },
      },
      error: {
        style: {
          background: '#FEE2E2',
          color: '#B91C1C',
          border: '1px solid #FCA5A5',
        },
      },
    }}
  />
)
