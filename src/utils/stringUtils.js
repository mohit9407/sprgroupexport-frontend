export function shortenId(value, start = 4, end = 4, dots = 3) {
  if (!value || value.length <= start + end) return value

  return `${value.slice(0, start)}${'.'.repeat(dots)}${value.slice(-end)}`
}

export const getAddressString = (address) => {
  if (!address) return ''

  const { address: street, city, state, country, zip } = address

  const addressParts = []

  if (street) addressParts.push(street)
  if (city) addressParts.push(city)
  if (zip) addressParts.push(zip)
  if (state) addressParts.push(state)
  if (country) addressParts.push(country)

  return addressParts?.length ? addressParts.join(', ') : null
}

export const getUpdatedObjectFields = (values, defaultValues) => {
  const updated = {}

  Object.keys(values).forEach((key) => {
    const current = values[key]
    const original = defaultValues?.[key]

    // normalize empty values
    const normalizedCurrent =
      current === '' || current === undefined ? null : current
    const normalizedOriginal =
      original === '' || original === undefined ? null : original

    // special case: dates
    if (key === 'dob' && current) {
      const formatted = new Date(current).toISOString().split('T')[0]
      if (formatted !== original) {
        updated.dob = formatted
      }
      return
    }

    if (normalizedCurrent !== normalizedOriginal) {
      updated[key] = current
    }
  })

  return updated
}

export function getFileNameFromUrl(url = '') {
  const fileWithPrefix = url.split('/').pop() || ''
  const index = fileWithPrefix.indexOf('_')

  return index !== -1 ? fileWithPrefix.slice(index + 1) : fileWithPrefix
}
