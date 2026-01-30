'use client'

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  showCloseButton = true,
  className = '',
}) {
  if (!open) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-[95vw]',
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center bg-black/40">
      <div
        className={`w-full ${sizeClasses[size]} max-h-[90vh] rounded-lg bg-white shadow-xl border border-gray-300 mx-4 ${className}`}
      >
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-4 border-b border-gray-300">
            {title && <h3 className="text-lg font-semibold">{title}</h3>}
            {showCloseButton && (
              <button
                className="h-5 w-5 text-gray-500 hover:bg-gray-100 rounded"
                onClick={onClose}
              >
                ✕
              </button>
            )}
          </div>
        )}

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {children}
        </div>

        {footer && <div className="border-t border-gray-300 p-4">{footer}</div>}
      </div>
    </div>
  )
}
