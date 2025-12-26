export default function AdminInputRow({
  label,
  name,
  id,
  placeholder,
  value,
  onChange,
  helpText,
  type = 'text',
}) {
  const inputId = id ?? name

  const handleChange = (ev) => {
    if (type !== 'number' || !isNaN(Number(ev.target.value))) {
      onChange(ev)
    }
  }

  return (
    <div className="grid grid-cols-12 gap-4 items-start mb-6">
      <label
        htmlFor={inputId}
        className="col-span-12 md:col-span-3 pt-2 text-sm text-right font-bold text-gray-700"
      >
        {label}
      </label>

      <div className="col-span-12 md:col-span-4">
        <input
          id={inputId}
          name={name}
          type={type === 'number' ? 'text' : type}
          placeholder={placeholder}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500
                     focus:border-blue-500"
          value={value}
          onChange={handleChange}
        />

        {helpText && (
          <span className="mt-1 block text-[11px] text-gray-500">
            {helpText}
          </span>
        )}
      </div>
    </div>
  )
}
