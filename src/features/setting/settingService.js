import api from '@/lib/axios'

const BASE_PATH = '/settings'

export const createSetting = async (data) => {
  try {
    return await api.post(`${BASE_PATH}/create`, data)
  } catch (error) {
    console.error('Error creating setting:', error)
    throw error
  }
}

export const getAllSettings = async () => {
  try {
    return await api.get(`${BASE_PATH}/get-all`)
  } catch (error) {
    console.error('Error fetching settings:', error)
    throw error
  }
}

export const getSettingById = async (id) => {
  try {
    return await api.get(`${BASE_PATH}/${id}`)
  } catch (error) {
    console.error(`Error fetching setting ${id}:`, error)
    throw error
  }
}

export const updateSetting = async (id, data) => {
  try {
    return await api.put(`${BASE_PATH}/update/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  } catch (error) {
    console.error(`Error updating setting ${id}:`, error)
    throw error
  }
}

export const deleteSetting = async (id) => {
  try {
    return await api.delete(`${BASE_PATH}/delete/${id}`)
  } catch (error) {
    console.error(`Error deleting setting ${id}:`, error)
    throw error
  }
}
