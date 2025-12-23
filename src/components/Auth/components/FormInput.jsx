import React from 'react'

const FormInput = ({
  type = 'text',
  name,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  touched,
  disabled = false,
  showPasswordToggle = false,
  onTogglePassword,
  showPassword = false,
  className = '',
}) => {
  return (
    <div className="relative">
      <input
        type={type === 'password' && showPassword ? 'text' : type}
        name={name}
        className={`w-full px-4 py-3 border ${
          touched && error ? 'border-red-500' : 'border-gray-300'
        } rounded-md focus:outline-none focus:border-amber-500 text-gray-700 ${className}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
      />
      {showPasswordToggle && (
        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm font-medium text-gray-500 hover:text-amber-700"
          onClick={onTogglePassword}
        >
          {showPassword ? 'HIDE' : 'SHOW'}
        </button>
      )}
      {touched && error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}

export default FormInput
