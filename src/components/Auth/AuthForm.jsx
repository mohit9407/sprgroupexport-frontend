'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import {
  registerUser,
  resetAuthState,
  loginUser,
} from '@/features/auth/authSlice'
import AuthTabs from './components/AuthTabs'
import LoginForm from './components/LoginForm'
import SignupForm from './components/SignupForm'
import { validateAuthForm } from '@/utils/validations'
import { useAuth } from '@/context/AuthContext'

const AuthForm = ({ isLogin = false }) => {
  const [activeTab, setActiveTab] = useState(isLogin ? 'login' : 'signup')
  const dispatch = useDispatch()
  const router = useRouter()
  const { loading, error, success } = useSelector((state) => state.auth)

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  })

  const [signupData, setSignupData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: 'male',
    agreeTerms: false,
  })

  const [showPassword, setShowPassword] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const [touched, setTouched] = useState({})
  const { login } = useAuth()
  const successRef = useRef(false)

  const handleLoginChange = (e) => {
    const { name, value } = e.target
    setLoginData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSignupChange = (e) => {
    const { name, value, type, checked } = e.target
    setSignupData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  useEffect(() => {
    return () => {
      dispatch(resetAuthState())
    }
  }, [dispatch, activeTab])

  // Handle successful signup
  useEffect(() => {
    if (success && !successRef.current) {
      successRef.current = true
      // Reset form data without triggering multiple renders
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSignupData((prev) => ({
        ...prev,
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        gender: 'male',
        agreeTerms: false,
      }))
      // Switch to login tab
      setActiveTab('login')
    } else if (!success) {
      successRef.current = false
    }
  }, [success])

  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  const validate = (values, isLogin) => {
    return validateAuthForm(values, isLogin)
  }

  const handleBlur = (e) => {
    const { name } = e.target
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }))

    const currentFormData = activeTab === 'login' ? loginData : signupData

    const errors = validate(currentFormData, activeTab === 'login')
    if (errors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: errors[name],
      }))
    } else {
      setFormErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()

    const errors = validate(loginData, true)
    setFormErrors(errors)

    const newTouched = {}
    Object.keys(loginData).forEach((key) => {
      newTouched[key] = true
    })
    setTouched(newTouched)

    if (Object.keys(errors).length === 0) {
      try {
        const result = await dispatch(loginUser(loginData)).unwrap()
        if (result && result.token) {
          login(
            {
              email: loginData.email,
              id: result.data._id,
              roles: Array.isArray(result.data?.roles)
                ? result.data.roles
                : ['user'],
              ...result.data,
            },
            {
              accessToken: result.token.accessToken,
              refreshToken: result.token.refreshToken,
            },
          )
          toast.success('Login successful!')
        }
      } catch (error) {
        console.error('Login failed:', error)
        toast.error(error.message || 'Login failed. Please try again.')
      }
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()

    const errors = validate(signupData, false)
    setFormErrors(errors)

    Object.keys(signupData).forEach((key) => {
      setTouched((prev) => ({
        ...prev,
        [key]: true,
      }))
    })

    if (Object.keys(errors).length === 0) {
      const { confirmPassword, agreeTerms, ...registrationData } = signupData
      try {
        await dispatch(registerUser(registrationData)).unwrap()
      } catch (error) {
        console.error('Registration failed:', error)
      }
    }
  }

  return (
    <div className="flex w-full justify-center items-center bg-gray-100 p-20">
      <div className="w-full max-w-md bg-white rounded-lg overflow-hidden">
        <AuthTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="p-8">
          {activeTab === 'login' ? (
            <LoginForm
              formData={loginData}
              loading={loading}
              errors={formErrors}
              touched={touched}
              handleChange={handleLoginChange}
              handleBlur={handleBlur}
              handleSubmit={handleLogin}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
            />
          ) : (
            <SignupForm
              formData={signupData}
              loading={loading}
              errors={formErrors}
              touched={touched}
              handleChange={handleSignupChange}
              handleBlur={handleBlur}
              handleSubmit={handleSignup}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default AuthForm
