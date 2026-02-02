'use client'

export function AdminTextAreaRow({
  label,
  name,
  id,
  placeholder,
  value = '',
  onChange,
  onBlur,
  helpText,
  error,
  required,
  fullWidth,
  rows = 4,
  ...rest
}) {
  const inputId = id ?? name

  return (
    <div className="grid grid-cols-12 gap-4 items-start mb-4">
      <label
        htmlFor={inputId}
        className={`col-span-12 md:col-span-3 pt-2 text-sm text-right font-bold
          ${error ? 'text-red-600' : 'text-gray-700'}`}
      >
        {label}
        {required && <span className="text-red-600">*</span>}
      </label>

      <div className={fullWidth ? 'col-span-8' : 'col-span-12 md:col-span-4'}>
        <textarea
          {...rest}
          id={inputId}
          rows={rows}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className={`w-full rounded border px-3 py-2 text-sm resize-none
            focus:outline-none focus:ring-2
            ${
              error
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
        />

        {(error || helpText) && (
          <span
            className={`mt-1 block text-[11px]
              ${error ? 'text-red-600' : 'text-gray-500'}`}
          >
            {error || helpText}
          </span>
        )}
      </div>
    </div>
  )
}

export default AdminTextAreaRow
