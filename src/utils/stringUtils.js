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
