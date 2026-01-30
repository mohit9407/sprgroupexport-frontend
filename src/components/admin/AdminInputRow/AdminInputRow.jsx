'use client'

import { Controller, useController, useFormContext } from 'react-hook-form'

export function AdminInputRow({
  label,
  name,
  id,
  placeholder,
  value = '',
  defaultValue = '',
  onChange,
  helpText,
  error,
  type = 'text',
  onBlur,
  required,
  fullWidth,
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
        <input
          {...rest}
          id={inputId}
          type={type === 'number' ? 'text' : type}
          className={`w-full rounded border px-3 py-2 text-sm
            focus:outline-none focus:ring-2
            ${
              error
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          onBlur={onBlur}
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

export function FormAdminInputRow({
  name,
  label,
  helpText,
  type = 'text',
  defaultValue = '',
  value: externalValue,
  required,
  fullWidth,
  readOnly = false,
  touchedField = false,
  ...rest
}) {
  const { control } = useFormContext()
  const { field, formState } = useController({
    name,
    control,
    defaultValue,
  })

  const { errors, touchedFields } = formState

  const errorMessage = touchedField
    ? touchedFields[name] && errors[name]?.message
    : errors[name]?.message

  // If externalValue is provided, use it, otherwise use the form field value
  const inputValue = externalValue !== undefined ? externalValue : field.value

  return (
    <AdminInputRow
      {...field}
      {...rest}
      label={label}
      error={errorMessage}
      helpText={helpText}
      type={type}
      value={inputValue}
      readOnly={readOnly}
      required={required}
      fullWidth={fullWidth}
      onChange={(e) => {
        // Only update if not readOnly
        if (!readOnly) {
          field.onChange(e)
        }
      }}
      onBlur={field.onBlur}
    />
  )
}

export default AdminInputRow
