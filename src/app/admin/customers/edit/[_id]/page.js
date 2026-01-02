'use client'

import { CustomerFormPage } from '@/components/admin/CustomerFormPage'
import { getCustomer } from '@/features/admin/customersService'
import React, { use, useEffect, useState } from 'react'

export default function EditCustomerPage({ params }) {
  const { _id } = use(params)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const getFormattedResponse = (response) => {
    const { firstName, lastName, email, gender, dob, mobileNo, status } =
      response
    return {
      firstName: firstName,
      lastName: lastName,
      email: email,
      gender: gender,
      dob: dob ? new Date(dob).toISOString().split('T')[0] : '',
      mobileNo: mobileNo,
      status: status,
    }
  }

  useEffect(() => {
    if (!_id) return

    getCustomer(_id)
      .then((resp) => setData(getFormattedResponse(resp)))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [_id])

  if (loading) return <div>Loading...</div>

  return (
    <CustomerFormPage mode="edit" title="Edit Customer" defaultValues={data} />
  )
}
