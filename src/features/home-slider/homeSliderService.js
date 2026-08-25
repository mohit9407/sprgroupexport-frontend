import api from '@/lib/axios'

const BASE_PATH = '/home-slider'

export const getAllHomeSliders = async () => {
  try {
    return await api.get(`${BASE_PATH}/get-all`)
  } catch (error) {
    console.error('Error fetching home sliders:', error)
    throw error
  }
}

export const createHomeSlider = async (data) => {
  try {
    return await api.post(`${BASE_PATH}/create`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  } catch (error) {
    console.error('Error creating home slider:', error)
    throw error
  }
}

export const updateHomeSlider = async (id, data) => {
  try {
    return await api.put(`${BASE_PATH}/update/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  } catch (error) {
    console.error('Error updating home slider:', error)
    throw error
  }
}

export const deleteHomeSlider = async (id) => {
  try {
    return await api.delete(`${BASE_PATH}/delete/${id}`)
  } catch (error) {
    console.error('Error deleting home slider:', error)
    throw error
  }
}
