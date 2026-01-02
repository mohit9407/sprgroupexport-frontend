'use client'

import { Controller, useFormContext } from 'react-hook-form'

export function AdminSelect({
  label,
  name,
  value,
  onChange,
  options = [],
  error,
}) {
  return (
    <div className="grid grid-cols-12 gap-4 items-start mb-4">
      <label
        className={`col-span-12 md:col-span-3 pt-2 text-sm text-right font-bold
          ${error ? 'text-red-600' : 'text-gray-700'}`}
      >
        {label}
      </label>

      <div className="col-span-12 md:col-span-4">
        <select
          name={name}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full rounded border px-3 py-2 text-sm
            ${error ? 'border-red-500' : 'border-gray-300'}
          `}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {error && (
          <span className="mt-1 block text-[11px] text-red-600">{error}</span>
        )}
      </div>
    </div>
  )
}

export function FormAdminSelect({ name, label, options }) {
  const {
    control,
    formState: { errors },
  } = useFormContext()

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <AdminSelect
          label={label}
          name={name}
          options={options}
          value={field.value}
          onChange={field.onChange}
          error={errors[name]?.message}
        />
      )}
    />
  )
}

export default AdminSelect
