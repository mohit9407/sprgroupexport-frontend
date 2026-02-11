'use client'

import { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaPhone,
  FaEnvelope,
  FaUser,
  FaVenusMars,
  FaCamera,
} from 'react-icons/fa'
import { getUserById, updateUserProfile } from '@/features/user/userSlice'
import { toast } from '@/utils/toastConfig'

export default function ProfilePage() {
  const dispatch = useDispatch()
  const router = useRouter()

  // Get user data from Redux store
  const { user, loading, error, updateLoading, updateSuccess, updateError } =
    useSelector((state) => state.user)

  // Initialize form data with empty values
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobileNo: '',
    gender: '',
    dob: '',
    gstNumber: '',
    panNumber: '',
  })
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const fileInputRef = useRef(null)

  const [isClient, setIsClient] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Set client-side flag on mount
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Load user data when component mounts
  useEffect(() => {
    if (!isClient) return

    // Get user ID from local storage
    let userId = null
    try {
      const storedUser = localStorage.getItem('user')
      const userObj = storedUser ? JSON.parse(storedUser) : null
      userId = userObj?._id || userObj?.id || null
    } catch (error) {
      console.error('Error accessing localStorage:', error)
      setIsLoading(false)
      router.push('/login')
      return
    }

    if (!userId) {
      console.warn('No user ID found in local storage')
      setIsLoading(false)
      router.push('/login')
      return
    }

    setIsLoading(true)
    dispatch(getUserById(userId))
      .unwrap()
      .catch((error) => {
        console.error('Failed to fetch user data:', error)
        toast.error(error)
        router.push('/login')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [dispatch, router, isClient])

  // Update form data when user data is loaded
  useEffect(() => {
    if (user) {
      // Format date to YYYY-MM-DD for date input
      const formatDate = (dateString) => {
        if (!dateString) return ''
        try {
          const date = new Date(dateString)
          return date.toISOString().split('T')[0]
        } catch (e) {
          console.error('Error formatting date:', e)
          return ''
        }
      }

      const newFormData = {
        firstName: user.firstName || user.name?.split(' ')[0] || '',
        lastName:
          user.lastName ||
          user.name?.split(' ').slice(1).join(' ').trim() ||
          '',
        email: user.email || '',
        mobileNo: user.mobileNo || '',
        gender: (user.gender || 'male').toLowerCase(),
        dob: formatDate(user.dob),
        gstNumber: user.gstNumber || '',
        panCardNumber: user.panCardNumber || '',
      }

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData(newFormData)

      // Set image preview if user has an image
      if (user.profileImage) {
        // Check if the image URL is relative and prepend base URL if needed
        const imageUrl = user.profileImage.startsWith('http')
          ? user.profileImage
          : `${process.env.NEXT_PUBLIC_API_BASE_URL || ''}${user.profileImage.startsWith('/') ? '' : '/'}${user.profileImage}`
        setImagePreview(imageUrl)
      } else {
        setImagePreview('')
      }
    }
  }, [user])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current.click()
  }

  // Show success/error messages
  useEffect(() => {
    if (updateSuccess) {
      toast.success('Profile updated successfully!')
    }
    if (updateError) {
      toast.error(updateError)
    }
  }, [updateSuccess, updateError])

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
      // Create FormData object
      const formDataToSend = new FormData()

      // Add user data to form data
      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key])
      })

      // Add image file if selected
      if (selectedImage) {
        formDataToSend.append('profileImage', selectedImage)
      }

      // Dispatch the update action with the formData
      const resultAction = await dispatch(updateUserProfile(formDataToSend))

      if (updateUserProfile.fulfilled.match(resultAction)) {
        // Update local storage if needed
        const currentUser = JSON.parse(localStorage.getItem('user'))
        if (currentUser) {
          // Update only the fields that were changed
          const updatedUser = {
            ...currentUser,
            ...formData,
            // Update image URL if a new image was uploaded
            ...(resultAction.payload?.image && {
              image: resultAction.payload.image,
            }),
          }
          localStorage.setItem('user', JSON.stringify(updatedUser))
        }
      } else if (updateUserProfile.rejected.match(resultAction)) {
        // Error is already handled by the slice's extraReducers
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error(error.message || 'Failed to update profile')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <FaArrowLeft className="mr-2" />
          <span>Back to Home</span>
        </Link>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Profile Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-gray-800">My Profile</h1>
            <p className="text-gray-500 text-sm">
              Manage your profile information
            </p>
          </div>

          <div className="p-6">
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative group">
                <div className="relative w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mb-4">
                  {imagePreview ? (
                    <Image
                      src={imagePreview}
                      alt={`${formData.firstName} ${formData.lastName}`}
                      fill
                      className="object-cover"
                      onError={() => setImagePreview('')}
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <FaUser className="text-gray-400 text-5xl" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                    <FaCamera className="text-white text-xl" />
                  </div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={triggerFileInput}
                  className="text-sm text-[#BA8B4E] font-medium hover:underline"
                  disabled={updateLoading}
                >
                  {updateLoading ? 'Updating...' : 'Change Photo'}
                </button>
              </div>
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>

            {/* Profile Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    First Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#BA8B4E] focus:border-[#BA8B4E] outline-none"
                      placeholder="First Name"
                    />
                  </div>
                </div>

                {/* Last Name */}
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#BA8B4E] focus:border-[#BA8B4E] outline-none"
                    placeholder="Last Name"
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    E-mail
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#BA8B4E] focus:border-[#BA8B4E] outline-none"
                      placeholder="E-mail"
                      disabled
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Phone
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaPhone className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      id="mobileNo"
                      name="mobileNo"
                      value={formData.mobileNo}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#BA8B4E] focus:border-[#BA8B4E] outline-none"
                      placeholder="Phone Number"
                    />
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <label
                    htmlFor="gender"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Gender
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaVenusMars className="h-4 w-4 text-gray-400" />
                    </div>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#BA8B4E] focus:border-[#BA8B4E] outline-none appearance-none bg-white"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer-not-to-say">
                        Prefer not to say
                      </option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg
                        className="h-4 w-4 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Date of Birth */}
                <div>
                  <label
                    htmlFor="dob"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Date of Birth
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaCalendarAlt className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      id="dob"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#BA8B4E] focus:border-[#BA8B4E] outline-none appearance-none"
                    />
                  </div>
                </div>

                {/* GST Number */}
                <div>
                  <label
                    htmlFor="gstNumber"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    GST Number
                  </label>
                  <input
                    type="text"
                    id="gstNumber"
                    name="gstNumber"
                    value={formData.gstNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#BA8B4E] focus:border-[#BA8B4E] outline-none"
                    placeholder="GST Number"
                    maxLength="15"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Format: 22AAAAA0000A1Z5
                  </p>
                </div>

                {/* PAN Card Number */}
                <div>
                  <label
                    htmlFor="panCardNumber"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    PAN Card Number
                  </label>
                  <input
                    type="text"
                    id="panCardNumber"
                    name="panCardNumber"
                    value={formData.panCardNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#BA8B4E] focus:border-[#BA8B4E] outline-none"
                    placeholder="PAN Card Number"
                    maxLength="10"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Format: ABCDE1234F
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={updateLoading}
                  className={`w-full md:w-auto px-6 py-2 bg-[#BA8B4E] text-white font-medium rounded-md hover:bg-[#9a7542] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#BA8B4E] transition-colors ${updateLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {updateLoading ? 'UPDATING...' : 'UPDATE'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
