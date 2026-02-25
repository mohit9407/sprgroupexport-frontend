import api from '@/lib/axios'

async function getAdminDashboard() {
  const response = await api.get('/dashboard/statistics')
  return response
}

async function getRecentOrders() {
  const response = await api.get('/dashboard/recent-orders')
  return response
}

async function getRecentCustomers() {
  const response = await api.get('/dashboard/recent-customers')
  return response
}

async function getRecentProducts() {
  const response = await api.get('/dashboard/recent-products')
  return response
}

async function getGoalCompletion() {
  const response = await api.get('/dashboard/goal-completion')
  return response
}

async function getAddedSaleReport(
  filter = 'thisMonth',
  startDate = '',
  endDate = '',
) {
  const params = new URLSearchParams({ filter })
  if (startDate) params.append('startDate', startDate)
  if (endDate) params.append('endDate', endDate)

  const response = await api.get(`/dashboard/added-sale-report?${params}`)
  return response
}

export const adminDashboardService = {
  getAdminDashboard,
  getRecentOrders,
  getRecentCustomers,
  getRecentProducts,
  getGoalCompletion,
  getAddedSaleReport,
}
