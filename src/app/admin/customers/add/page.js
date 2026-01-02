'use client'

import { CustomerFormPage } from '@/components/admin/CustomerFormPage'
import React from 'react'

const defaultValues = {
  firstName: '',
  lastName: '',
  gender: '',
  dob: '',
  mobileNo: '',
  email: '',
  password: '',
  status: 'active',
}

export const AddCustomerPage = () => {
  return (
    <CustomerFormPage
      mode="add"
      title="Add Customer"
      defaultValues={defaultValues}
    />
  )
}

export default AddCustomerPage
