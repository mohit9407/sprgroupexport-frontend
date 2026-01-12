'use client'

import ButtonLoader from '@/components/admin/ButtonLoader'
import { CustomerFormPage } from '@/components/admin/CustomerFormPage'
import { getCustomer } from '@/features/customers/customersSlice'
import React, { use, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

export default function EditCustomerPage({ params }) {
  const { _id } = use(params)
  const dispatch = useDispatch()
  const { data, isLoading } = useSelector(
    (state) => state.customers.getCustomer,
  )

  const customerDetails = useMemo(() => {
    if (!data) {
      return null
    }
    const { firstName, lastName, email, gender, dob, mobileNo, status } = data
    return {
      firstName: firstName,
      lastName: lastName,
      email: email,
      gender: gender,
      dob: dob ? new Date(dob).toISOString().split('T')[0] : '',
      mobileNo: mobileNo,
      status: status,
    }
  }, [data])

  useEffect(() => {
    if (!_id) return
    dispatch(getCustomer({ id: _id }))
  }, [_id])

  if (isLoading)
    return (
      <div className="flex justify-center items-center">
        <ButtonLoader className="inline-flex text-sky-600" /> Loading...
      </div>
    )

  return (
    <CustomerFormPage
      mode="edit"
      title="Edit Customer"
      userId={_id}
      defaultValues={customerDetails}
    />
  )
}
