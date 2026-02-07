import api from '@/lib/axios'
const createGeneralSetting = async () => {
  return await api.post('/general-setting/create')
}

const getGeneralSetting = async () => {
  return await api.get('/general-setting/get-all')
}
const updateGeneralSetting = async (data) => {
  return await api.put('/general-setting/update', data)
}

export const generalSetting = {
  createGeneralSetting,
  getGeneralSetting,
  updateGeneralSetting,
}
