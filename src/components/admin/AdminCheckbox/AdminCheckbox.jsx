'use client'

import React from 'react'
import { Controller, useFormContext } from 'react-hook-form'

export function AdminCheckbox({
  label,
  name,
  id,
  checked = false,
  onChange,
  helpText,
  error,
  disabled = false,
  additionalText,
}) {
  const checkboxId = id ?? name

  return (
    <div className="grid grid-cols-12 gap-4 items-start mb-4">
      <label
        htmlFor={checkboxId}
        className={`col-span-12 md:col-span-3 pt-2 text-sm text-right font-bold
            ${error ? 'text-red-600' : 'text-gray-700'}
            ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
          `}
      >
        {label}
      </label>
      <div className="col-span-12 md:col-span-4 gap-2 pt-2">
        <input
          id={checkboxId}
          name={name}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.checked)}
          className={`mr-1 min-h-4 min-w-4 rounded border
              ${error ? 'border-red-500' : 'border-gray-300'}
              focus:ring-2 focus:ring-blue-500
            `}
        />
        {additionalText && (
          <span className="text-[14px] align-text-bottom text-gray-500">
            {additionalText}
          </span>
        )}
      </div>
      {(error || helpText) && (
        <span
          className={`mt-1 block text-[11px]
              ${error ? 'text-red-600' : 'text-gray-500'}
            `}
        >
          {error || helpText}
        </span>
      )}
    </div>
  )
}

export function FormAdminCheckbox({
  name,
  label,
  helpText,
  additionalText,
  disabled = false,
}) {
  const { control, formState } = useFormContext()
  const { errors, touchedFields } = formState

  const errorMessage = touchedFields[name] && errors[name]?.message

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={false}
      render={({ field }) => (
        <AdminCheckbox
          name={name}
          label={label}
          checked={!!field.value}
          onChange={field.onChange}
          helpText={helpText}
          error={errorMessage}
          disabled={disabled}
          additionalText={additionalText}
        />
      )}
    />
  )
}

export default AdminCheckbox
