import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { registerUser } from '../authSlice'

export const useRegister = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    gender: 'male', // default value
  })

  const dispatch = useDispatch()
  const { loading, error, success } = useSelector((state) => state.auth)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await dispatch(registerUser(formData)).unwrap()
      // Reset form on successful registration
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        gender: 'male',
      })
      return { success: true }
    } catch (error) {
      console.error('Registration failed:', error)
      return { success: false, error: error.message }
    }
  }

  return {
    formData,
    handleChange,
    handleSubmit,
    loading,
    error,
    success,
  }
}
