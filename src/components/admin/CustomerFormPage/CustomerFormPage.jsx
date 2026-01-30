'use client'

import { FormProvider, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { FormAdminInputRow } from '../AdminInputRow'
import { FormAdminRadioGroup } from '../AdminRadioGroup'
import { FormAdminSelect } from '../AdminSelect'
import { useEffect, useState } from 'react'
import * as yup from 'yup'
import { useRouter } from 'next/navigation'
import { AdminCheckbox } from '../AdminCheckbox'
import { toast } from '@/utils/toastConfig'
import {
  addNewCustomer,
  updateCustomer,
} from '@/features/customers/customersSlice'
import { useDispatch, useSelector } from 'react-redux'
import { getUpdatedObjectFields } from '@/utils/stringUtils'

const getCustomerSchema = (isPasswordRequired = true) => {
  const passwordSchema = yup
    .string()
    .min(6, 'Minimum 6 characters')
    .matches(/[0-9]/, 'At least one number')
    .matches(/[^a-zA-Z0-9]/, 'At least one special character')

  return yup.object({
    firstName: yup.string().required('First name is required'),
    lastName: yup.string().required('Last name is required'),

    dob: yup
      .date()
      .nullable()
      .typeError('Date of birth is required')
      .required('Date of birth is required'),

    mobileNo: yup
      .string()
      .nullable()
      .test('len', 'Minimum 10 digits', (val) => !val || val.length >= 10),

    email: yup.string().email('Invalid email').required('Email is required'),

    password: isPasswordRequired
      ? passwordSchema.required('Password is required')
      : passwordSchema.notRequired(),
  })
}

export function CustomerFormPage({
  mode = 'add',
  userId,
  defaultValues,
  title,
}) {
  const isEditMode = mode === 'edit'
  const dispatch = useDispatch()
  const router = useRouter()
  const [wantPasswordChange, setWantPasswordChange] = useState(false)
  const {
    updateCustomer: updateCustomerData,
    addNewCustomer: addNewCustomerData,
  } = useSelector((state) => state.customers)
  const formProviders = useForm({
    resolver: yupResolver(getCustomerSchema(!isEditMode || wantPasswordChange)),
    defaultValues: defaultValues,
    mode: 'onBlur',
    reValidateMode: 'onChange',
    shouldUnregister: true,
  })

  const setFieldErrorFromAPI = (errors) => {
    formProviders.setError(errors)
  }

  const handleChangePassword = (isChange) => {
    if (!isChange) {
      formProviders.setValue('password', undefined)
      formProviders.clearErrors('password')
    }
    setWantPasswordChange(isChange)
  }

  const onSubmit = async (values) => {
    const {
      firstName,
      lastName,
      email,
      password,
      dob,
      mobileNo,
      gender,
      status,
    } = values
    const dateObj = new Date(dob)
    const isoString = dateObj.toISOString()
    const formattedDate = isoString.split('T')[0]
    const payload = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: password,
      gender: gender,
      dob: formattedDate,
      mobileNo: mobileNo,
      status: status,
    }

    try {
      if (isEditMode) {
        const editPayload = getUpdatedObjectFields(payload, defaultValues)
        dispatch(updateCustomer({ id: userId, data: editPayload }))
        toast.success('Customer Updated Successfully!')
        return
      }
      const resp = await dispatch(addNewCustomer(payload)).unwrap()
      toast.success('Customer Created Successfully!')
      router.push(`/admin/customers/edit/${resp?.data._id}`)
      return
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    if (addNewCustomerData?.isError || updateCustomerData?.isError) {
      setFieldErrorFromAPI({
        ...(addNewCustomerData?.message || {}),
        ...(updateCustomerData?.message || {}),
      })
    }
  }, [addNewCustomerData?.isError, updateCustomerData?.isError])

  return (
    <div className="space-y-3">
      <div className="border-b-2 pb-3 border-cyan-400">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      </div>
      <FormProvider {...formProviders}>
        <form onSubmit={formProviders.handleSubmit(onSubmit, console.error)}>
          <FormAdminInputRow
            required
            name="firstName"
            label="First Name"
            placeholder=""
            helpText="Please enter first name."
          />
          <FormAdminInputRow
            required
            name="lastName"
            label="Last Name"
            placeholder=""
            helpText="Please enter last name."
          />
          <FormAdminRadioGroup
            required
            name="gender"
            label="Gender"
            options={[
              { label: 'Male', value: 'male' },
              { label: 'Female', value: 'female' },
            ]}
          />
          <FormAdminInputRow
            required
            name="dob"
            label="DOB"
            type="date"
            placeholder=""
            helpText="Please enter date of birth."
          />
          <FormAdminInputRow
            name="mobileNo"
            label="Telephone"
            placeholder=""
            helpText="Please enter telephone."
          />

          <hr className="my-4 border-gray-300" />

          <FormAdminInputRow
            required
            name="email"
            label="Email Address"
            placeholder=""
            helpText="Please enter email address."
          />
          {isEditMode ? (
            <AdminCheckbox
              name="wantPasswordChange"
              label="Do you want to Change Password?"
              checked={wantPasswordChange}
              onChange={handleChangePassword}
            />
          ) : null}

          {(!isEditMode || wantPasswordChange) && (
            <FormAdminInputRow
              required
              name="password"
              label="Password"
              placeholder=""
              helpText="Please enter password."
            />
          )}
          <FormAdminSelect
            name="status"
            label="Status"
            options={[
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
            ]}
          />

          <hr className="my-4 border-gray-300" />

          <div className="flex gap-3 justify-center">
            <button
              type="submit"
              className="px-5 py-2 rounded bg-sky-600 text-white font-semibold hover:bg-sky-700"
            >
              Submit
            </button>

            <button
              type="button"
              className="px-5 py-2 rounded border border-gray-300 text font-semibold-gray-700 hover:bg-gray-100"
              onClick={router.back}
            >
              Back
            </button>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}

export default CustomerFormPage
