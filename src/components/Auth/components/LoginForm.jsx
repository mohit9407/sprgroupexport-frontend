'use client'

import Link from 'next/link'
import FormInput from './FormInput'

const LoginForm = ({
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
        Welcome to SPR Group
      </h2>
      <p className="text-gray-500 text-center text-sm mb-6">
        Please login using account detail below.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
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

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-xs font-medium text-[#b7853f] hover:text-[#a07637] hover:underline"
          >
            Forgot your password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-[#b7853f] text-white py-3 px-4 rounded-md hover:bg-[#a07637] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#a07637] transition ${
            loading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </>
  )
}

export default LoginForm
