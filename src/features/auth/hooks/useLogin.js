import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { loginUser } from '../authSlice'

export const useLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const dispatch = useDispatch()
  const { loading, error } = useSelector((state) => state.auth)

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
      await dispatch(loginUser(formData)).unwrap()
      // Reset form on successful login
      setFormData({
        email: '',
        password: '',
      })
      return { success: true }
    } catch (error) {
      console.error('Login failed:', error)
      return { success: false, error: error.message }
    }
  }

  return {
    formData,
    handleChange,
    handleSubmit,
    loading,
    error,
  }
}
