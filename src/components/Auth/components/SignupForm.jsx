'use client'

import Link from 'next/link'
import FormInput from './FormInput'

const SignupForm = ({
  formData,
  loading,
  errors,
  touched,
  handleChange,
  handleBlur,
  handleSubmit,
  showPassword,
  setShowPassword,
}) => {
  return (
    <>
      <h2 className="text-2xl font-medium text-center mb-2">
        Create an account
      </h2>
      <p className="text-gray-500 text-center text-sm mb-6">
        Please register using account detail below.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FormInput
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.firstName && errors.firstName}
              touched={touched.firstName}
              disabled={loading}
            />
          </div>
          <div>
            <FormInput
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.lastName && errors.lastName}
              touched={touched.lastName}
              disabled={loading}
            />
          </div>
        </div>

        <FormInput
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.email && errors.email}
          touched={touched.email}
          disabled={loading}
        />

        <FormInput
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.password && errors.password}
          touched={touched.password}
          disabled={loading}
          showPasswordToggle
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword(!showPassword)}
        />

        <FormInput
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.confirmPassword && errors.confirmPassword}
          touched={touched.confirmPassword}
          disabled={loading}
          showPasswordToggle
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword(!showPassword)}
        />

        <div>
          <select
            name="gender"
            className={`w-full px-4 py-3 border ${
              touched.gender && errors.gender
                ? 'border-red-500'
                : 'border-gray-300'
            } rounded-md focus:outline-none focus:border-[#b7853f] text-gray-700`}
            value={formData.gender}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={loading}
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          {touched.gender && errors.gender && (
            <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
          )}
        </div>

        <div className="flex items-start">
          <div className="flex items-center h-5 mt-1">
            <input
              id="agreeTerms"
              name="agreeTerms"
              type="checkbox"
              checked={formData.agreeTerms}
              onChange={handleChange}
              onBlur={handleBlur}
              className="h-4 w-4 text-[#b7853f] focus:ring-[#b7853f] border-gray-300 rounded"
              disabled={loading}
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="agreeTerms" className="font-medium text-gray-700">
              I agree to the{' '}
              <a href="#" className="text-[#b7853f] hover:text-[#a07637]">
                Terms and Conditions
              </a>
            </label>
            {touched.agreeTerms && errors.agreeTerms && (
              <p className="mt-1 text-sm text-red-600">{errors.agreeTerms}</p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-[#b7853f] text-white py-3 px-4 rounded-md hover:bg-[#a07637] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#a07637] transition ${
            loading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
    </>
  )
}

export default SignupForm
