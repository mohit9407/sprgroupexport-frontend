'use client'

import { useController, useFormContext } from 'react-hook-form'

const allowsDecimal = (step) => {
  if (step === undefined || step === null || step === '') return true
  if (step === 'any') return true
  const stepNum = Number(step)
  return !Number.isNaN(stepNum) && stepNum % 1 !== 0
}

const sanitizeNumberInput = (rawValue, { decimal = true, min } = {}) => {
  let next = String(rawValue ?? '')

  // Keep only digits, one decimal point (when allowed), and a leading minus when min allows it
  next = next.replace(/[^\d.-]/g, '')

  if (min !== undefined && Number(min) >= 0) {
    next = next.replace(/-/g, '')
  } else {
    const isNegative = next.startsWith('-')
    next = next.replace(/-/g, '')
    if (isNegative) next = `-${next}`
  }

  if (!decimal) {
    next = next.replace(/\./g, '')
  } else {
    const negative = next.startsWith('-')
    const unsigned = negative ? next.slice(1) : next
    const [whole, ...rest] = unsigned.split('.')
    next = `${negative ? '-' : ''}${whole}${rest.length ? `.${rest.join('').replace(/\./g, '')}` : ''}`
  }

  return next
}

const normalizeNumberOnBlur = (rawValue, { decimal = true } = {}) => {
  if (
    rawValue === '' ||
    rawValue === '-' ||
    rawValue === '.' ||
    rawValue === '-.'
  ) {
    return ''
  }

  const parsed = Number(rawValue)
  if (Number.isNaN(parsed)) return ''

  // Keep typed precision for decimals; integers stay whole numbers
  if (!decimal) return String(Math.trunc(parsed))
  return String(parsed)
}

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
  inputRef,
  ...rest
}) {
  const inputId = id ?? name
  const isNumber = type === 'number'

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
          ref={inputRef}
          id={inputId}
          name={name}
          // text + inputMode lets users type "10." without the browser stripping the dot
          type={isNumber ? 'text' : type}
          inputMode={
            isNumber
              ? allowsDecimal(rest.step)
                ? 'decimal'
                : 'numeric'
              : undefined
          }
          className={`w-full rounded border px-3 py-2 text-sm
            focus:outline-none focus:ring-2
            ${
              error
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
          value={value ?? ''}
          defaultValue={defaultValue}
          onChange={onChange}
          onBlur={(e) => {
            onBlur?.(e)
          }}
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
  onBlur,
  onChange: onParentChange,
  step,
  min,
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

  const inputValue = externalValue !== undefined ? externalValue : field.value
  const isNumber = type === 'number'
  const decimal = allowsDecimal(step)

  return (
    <AdminInputRow
      {...rest}
      name={field.name}
      inputRef={field.ref}
      label={label}
      error={errorMessage}
      helpText={helpText}
      type={type}
      step={step}
      min={min}
      value={inputValue ?? ''}
      readOnly={readOnly}
      required={required}
      fullWidth={fullWidth}
      onChange={(e) => {
        if (readOnly) return

        if (isNumber) {
          const next = sanitizeNumberInput(e.target.value, { decimal, min })
          field.onChange(next)
          onParentChange?.({
            ...e,
            target: { ...e.target, value: next, name },
          })
          return
        }

        field.onChange(e)
        onParentChange?.(e)
      }}
      onBlur={(e) => {
        if (isNumber && !readOnly) {
          const normalized = normalizeNumberOnBlur(e.target.value, { decimal })
          if (normalized !== e.target.value) {
            field.onChange(normalized)
          }
        }
        field.onBlur()
        onBlur?.(e)
      }}
    />
  )
}

export default AdminInputRow
