export const validateAuthForm = (values, isLogin = false) => {
  const errors = {}

  if (!isLogin) {
    if (!values.firstName?.trim()) {
      errors.firstName = 'First name is required'
    }

    if (!values.lastName?.trim()) {
      errors.lastName = 'Last name is required'
    }

    if (values.password !== values.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    if (!values.agreeTerms) {
      errors.agreeTerms = 'You must agree to the terms and conditions'
    }
  }

  if (!values.email) {
    errors.email = 'Email is required'
  } else if (!/\S+@\S+\.\S+/.test(values.email)) {
    errors.email = 'Email is invalid'
  }

  if (!values.password) {
    errors.password = 'Password is required'
  } else if (values.password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
  }

  return errors
}
