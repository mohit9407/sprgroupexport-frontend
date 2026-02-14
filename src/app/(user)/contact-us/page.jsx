'use client'

import { useState, useEffect } from 'react'
import {
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhone,
  FaTwitterSquare,
} from 'react-icons/fa'
import { GrInstagram } from 'react-icons/gr'
import { BsGoogle } from 'react-icons/bs'
import { ImFacebook2 } from 'react-icons/im'
import { motion } from 'framer-motion'
import { useSelector, useDispatch } from 'react-redux'
import {
  submitContactForm,
  resetContactState,
} from '@/features/contact/contactSlice'

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })

  const [errors, setErrors] = useState({})
  const dispatch = useDispatch()
  const { loading, success, error } = useSelector((state) => state.contact)
  const { settings = [] } = useSelector(
    (state) => state.settings || { settings: [], status: 'idle' },
  )
  const { data: generalSettings = {} } = useSelector(
    (state) => state.generalSetting || { data: {}, status: 'idle' },
  )
  // Social media links from settings
  const socialLinks = [
    {
      name: 'Facebook',
      icon: ImFacebook2,
      url: settings[0]?.faceBookLink || '#',
      color: '#3b5998',
    },
    {
      name: 'Twitter',
      icon: FaTwitterSquare,
      url: settings[0]?.twitterLink || '#',
      color: '#1DA1F2',
    },
    {
      name: 'Google',
      icon: BsGoogle,
      url: settings[0]?.googleLink || '#',
      color: '#DB4437',
    },
    {
      name: 'Instagram',
      icon: GrInstagram,
      url: settings[0]?.instagramLink || '#',
      color: '#E1306C',
    },
  ]
  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required'
    if (!formData.message.trim()) newErrors.message = 'Message is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      dispatch(submitContactForm(formData))
    }
  }

  // Reset form on successful submission
  useEffect(() => {
    if (success) {
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      })
      // Reset the contact state after 5 seconds
      const timer = setTimeout(() => {
        dispatch(resetContactState())
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [success, dispatch])

  return (
    <div className="min-h-screen bg-white">
      <main className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl font-bold text-[#BA8B4E] mb-4">Contact Us</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Have questions or need assistance? We're here to help! Reach out to
            us and our team will get back to you as soon as possible.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white p-6 sm:p-8 rounded-lg border border-gray-200 shadow-sm"
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Send us a message
            </h2>

            {error && (
              <div className="mb-6 p-4 rounded-md text-sm bg-red-50 text-red-700 border border-red-200">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-6 p-4 rounded-md text-sm bg-green-50 text-green-700 border border-green-200">
                Your message has been sent successfully! We'll get back to you
                soon.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  } rounded-md focus:ring-2 focus:ring-[#BA8B4E] focus:border-transparent`}
                  placeholder="John Doe"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  } rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="you@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border ${
                    errors.subject ? 'border-red-300' : 'border-gray-300'
                  } rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="How can we help?"
                />
                {errors.subject && (
                  <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Your Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border ${
                    errors.message ? 'border-red-300' : 'border-gray-300'
                  } rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Tell us more about your inquiry..."
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-red-600">{errors.message}</p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#BA8B4E] text-white py-2.5 px-6 rounded-md hover:bg-[#a87d45] focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-colors duration-200 flex items-center justify-center font-medium"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </div>
            </form>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white p-6 sm:p-8 rounded-lg border border-gray-200 shadow-sm"
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Contact Information
            </h2>
            <p className="text-gray-600 mb-8">
              We'd love to hear from you! Here's how you can reach us.
            </p>

            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-amber-50 p-3 rounded-full text-[#BA8B4E]">
                  <FaMapMarkerAlt className="h-5 w-5" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    Our Location
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {generalSettings?.address || '123 Business Street'}
                    <br />
                    {`${generalSettings?.city || 'City'}, ${generalSettings?.state || 'State'}`}
                    <br />
                    {generalSettings?.country || 'Country'} -{' '}
                    {generalSettings?.zip || 'ZIP'}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 bg-amber-50 p-3 rounded-full text-[#BA8B4E]">
                  <FaEnvelope className="h-5 w-5" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    Email Us
                  </h3>
                  <p className="text-[#BA8B4E] hover:underline mt-1">
                    <a
                      href={`mailto:${generalSettings?.contactUsEmail || 'sprgroup100@gmail.com'}`}
                      className="hover:underline"
                    >
                      {generalSettings?.contactUsEmail ||
                        'sprgroup100@gmail.com'}
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 bg-amber-50 p-3 rounded-full text-[#BA8B4E]">
                  <FaPhone className="h-5 w-5" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    Call Us
                  </h3>
                  <p className="text-gray-600 mt-1">
                    <a
                      href={`tel:${generalSettings?.phoneNumber || '+1234567890'}`}
                      className="text-[#BA8B4E] hover:underline transition-colors"
                    >
                      {generalSettings?.phoneNumber || '+1 (234) 567-890'}
                    </a>
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    Mon - Fri: 9:00 AM - 6:00 PM
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Follow Us
              </h3>
              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-[#BA8B4E] transition-colors"
                    aria-label={social.name}
                  >
                    <social.icon className="w-6 h-6" />
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

export default ContactUs
