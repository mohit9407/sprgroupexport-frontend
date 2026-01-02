'use client'

import { Controller, useFormContext } from 'react-hook-form'

export function AdminRadioGroup({
  label,
  name,
  options = [],
  value,
  onChange,
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

      <div className="col-span-12 md:col-span-4 space-y-2">
        {options.map((opt) => (
          <label
            key={opt.value}
            className="flex items-center gap-2 text-sm cursor-pointer"
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              className="accent-blue-600"
            />
            {opt.label}
          </label>
        ))}

        {error && (
          <span className="block text-[11px] text-red-600">{error}</span>
        )}
      </div>
    </div>
  )
}

export function FormAdminRadioGroup({ name, label, options }) {
  const {
    control,
    formState: { errors },
  } = useFormContext()

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <AdminRadioGroup
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

export default AdminRadioGroup
