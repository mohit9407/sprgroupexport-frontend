import api from '@/lib/axios'

export async function getAllUsers({
  pageIndex,
  pageSize,
  search,
  sortBy,
  sortDir,
  filterBy,
}) {
  const params = new URLSearchParams()

  params.set('page', String(pageIndex + 1))
  params.set('limit', String(pageSize))

  if (search) params.set('search', search)
  if (sortBy) params.set('sort', sortBy)
  if (sortDir) params.set('direction', sortDir)
  if (filterBy) params.set('filterBy', filterBy)

  const res = await api.get(`/auth/get-all-users?${params.toString()}`)

  return res
}
