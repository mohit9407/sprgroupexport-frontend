'use client'

import { FormProvider, useForm } from 'react-hook-form'
import { FormAdminInputRow } from '../AdminInputRow'
import { FormAdminCheckbox } from '../AdminCheckbox'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { verifyGST, clearGSTData } from '@/features/gst/gstSlice'
import api from '@/lib/axios'

export default function ManualUserFormPage({
  mode = 'add',
  defaultValues,
  title = 'Manual User Create',
  onSubmit,
  submitting = false,
  onExistingUserDetected,
  onClearForm,
}) {
  const isEditMode = mode === 'edit'
  const router = useRouter()
  const dispatch = useDispatch()

  const {
    loading: gstLoading,
    verifiedData,
    error: gstError,
  } = useSelector((state) => state.gst)

  const [lookingUpByEmail, setLookingUpByEmail] = useState(false)
  const [isAutoFilled, setIsAutoFilled] = useState(false)
  const lastLookedUpEmailRef = useRef('')
  const emailLookupTimerRef = useRef(null)
  const gstLookupTimerRef = useRef(null)
  const lastLookedUpGSTRef = useRef('')

  const methods = useForm({
    defaultValues: {
      firstName: defaultValues?.firstName ?? '',
      lastName: defaultValues?.lastName ?? '',
      email: defaultValues?.email ?? '',
      mobileNo: defaultValues?.mobileNo ?? '',
      address: {
        fullName: defaultValues?.address?.fullName ?? '',
        address: defaultValues?.address?.address ?? '',
        city: defaultValues?.address?.city ?? '',
        state: defaultValues?.address?.state ?? '',
        country: defaultValues?.address?.country ?? '',
        zip: defaultValues?.address?.zip ?? '',
        mobileNo: defaultValues?.address?.mobileNo ?? '',
        gst: defaultValues?.address?.gst ?? '',
        pancard: defaultValues?.address?.pancard ?? '',
        isDefault: defaultValues?.address?.isDefault ?? false,
      },
    },
  })

  const { reset, handleSubmit } = methods

  useEffect(() => {
    if (defaultValues) {
      reset({
        firstName: defaultValues?.firstName ?? '',
        lastName: defaultValues?.lastName ?? '',
        email: defaultValues?.email ?? '',
        mobileNo: defaultValues?.mobileNo ?? '',
        address: {
          fullName: defaultValues?.address?.fullName ?? '',
          address: defaultValues?.address?.address ?? '',
          city: defaultValues?.address?.city ?? '',
          state: defaultValues?.address?.state ?? '',
          country: defaultValues?.address?.country ?? '',
          zip: defaultValues?.address?.zip ?? '',
          mobileNo: defaultValues?.address?.mobileNo ?? '',
          gst: defaultValues?.address?.gst ?? '',
          pancard: defaultValues?.address?.pancard ?? '',
          isDefault: defaultValues?.address?.isDefault ?? false,
        },
      })
    }
  }, [defaultValues, reset])

  useEffect(() => {
    if (isEditMode) return

    const subscription = methods.watch((values, { name }) => {
      if (name !== 'email') return

      const email = (values?.email || '').trim().toLowerCase()
      if (!email) return
      if (!email.includes('@')) return
      if (email === lastLookedUpEmailRef.current) return

      if (emailLookupTimerRef.current) {
        clearTimeout(emailLookupTimerRef.current)
        emailLookupTimerRef.current = null
      }

      emailLookupTimerRef.current = setTimeout(async () => {
        try {
          setLookingUpByEmail(true)
          lastLookedUpEmailRef.current = email

          const res = await api.get('/auth/admin/get-user-by-email', {
            params: { email },
          })

          const user = res?.data?.user
          const defaultShipping = res?.data?.defaultShippingAddress
          const userId = res?.data?.userId
          const defaultShippingAddressId = res?.data?.defaultShippingAddressId

          if (!user) return

          setIsAutoFilled(true)

          reset(
            {
              firstName: user?.firstName ?? '',
              lastName: user?.lastName ?? '',
              email: user?.email ?? email,
              mobileNo: user?.mobileNo ?? '',
              address: {
                fullName:
                  defaultShipping?.fullName ??
                  `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
                address: defaultShipping?.address ?? '',
                city: defaultShipping?.city ?? '',
                state: defaultShipping?.state ?? '',
                country: defaultShipping?.country ?? '',
                zip: defaultShipping?.zip ?? '',
                mobileNo: defaultShipping?.mobileNo ?? user?.mobileNo ?? '',
                gst: defaultShipping?.gst ?? '',
                pancard: defaultShipping?.pancard ?? '',
                isDefault: defaultShipping?.isDefault ?? false,
              },
            },
            {
              keepDirtyValues: true,
            },
          )

          if (typeof onExistingUserDetected === 'function') {
            onExistingUserDetected({
              userId: userId || user?._id || '',
              shippingAddressId:
                defaultShippingAddressId || defaultShipping?._id || '',
              email: user?.email || email,
              userData: res.data,
            })
          }
        } catch (e) {
          lastLookedUpEmailRef.current = ''
        } finally {
          setLookingUpByEmail(false)
        }
      }, 600)
    })

    return () => {
      subscription.unsubscribe()
      if (emailLookupTimerRef.current) {
        clearTimeout(emailLookupTimerRef.current)
        emailLookupTimerRef.current = null
      }
      if (gstLookupTimerRef.current) {
        clearTimeout(gstLookupTimerRef.current)
        gstLookupTimerRef.current = null
      }
      dispatch(clearGSTData())
    }
  }, [isEditMode, methods, reset, dispatch])

  // GST lookup effect - triggers when GST field changes
  useEffect(() => {
    if (isEditMode) return

    const subscription = methods.watch((values, { name }) => {
      if (name !== 'address.gst') return

      const gst = (values?.address?.gst || '').trim().toUpperCase()
      if (!gst) return
      if (gst.length !== 15) return
      if (gst === lastLookedUpGSTRef.current) return

      if (gstLookupTimerRef.current) {
        clearTimeout(gstLookupTimerRef.current)
        gstLookupTimerRef.current = null
      }

      gstLookupTimerRef.current = setTimeout(() => {
        lastLookedUpGSTRef.current = gst
        dispatch(verifyGST(gst))
      }, 600)
    })

    return () => {
      subscription.unsubscribe()
      if (gstLookupTimerRef.current) {
        clearTimeout(gstLookupTimerRef.current)
        gstLookupTimerRef.current = null
      }
    }
  }, [isEditMode, methods, dispatch])

  // Auto-fill user data when GST is verified
  useEffect(() => {
    if (!verifiedData?.data) return

    const { lgnm, pradr, gstin, stj } = verifiedData.data
    const addressParts = pradr?.addr || {}

    // Extract PAN from GSTIN (characters 2-12)
    const pancard = gstin ? gstin.substring(2, 12) : ''

    // Extract address components
    const stateCode = addressParts.stcd || ''
    let stateName = ''
    let cityName = addressParts.dst || ''
    const address = pradr?.adr || ''
    const zip = addressParts.pncd || ''

    // Find state name from code
    if (stateCode) {
      const stateMapping = {
        '01': 'Jammu and Kashmir',
        '02': 'Himachal Pradesh',
        '03': 'Punjab',
        '04': 'Chandigarh',
        '05': 'Uttarakhand',
        '06': 'Haryana',
        '07': 'Delhi',
        '08': 'Rajasthan',
        '09': 'Uttar Pradesh',
        10: 'Bihar',
        11: 'Sikkim',
        12: 'Arunachal Pradesh',
        13: 'Nagaland',
        14: 'Manipur',
        15: 'Mizoram',
        16: 'Tripura',
        17: 'Meghalaya',
        18: 'Assam',
        19: 'West Bengal',
        20: 'Jharkhand',
        21: 'Odisha',
        22: 'Chhattisgarh',
        23: 'Madhya Pradesh',
        24: 'Gujarat',
        25: 'Daman and Diu',
        26: 'Dadra and Nagar Haveli and Daman and Diu',
        27: 'Maharashtra',
        28: 'Andhra Pradesh',
        29: 'Karnataka',
        30: 'Goa',
        31: 'Lakshadweep',
        32: 'Kerala',
        33: 'Tamil Nadu',
        34: 'Puducherry',
        35: 'Andaman and Nicobar Islands',
        36: 'Telangana',
        37: 'Andhra Pradesh',
      }
      stateName = stateMapping[stateCode] || ''
    } else if (stj) {
      stateName = stj.split('State - ')[1]?.split(',')[0]?.trim() || ''
    }

    reset(
      {
        firstName: lgnm?.split(' ')[0] || '',
        lastName: lgnm?.split(' ').slice(1).join(' ') || '',
        address: {
          fullName: lgnm || '',
          address: address || '',
          city: cityName || '',
          state: stateName || '',
          country: 'India',
          zip: zip || '',
          gst: gstin || '',
          pancard: pancard || '',
        },
      },
      { keepDirtyValues: true },
    )
    // setIsAutoFilled(true)
  }, [verifiedData, reset])

  const handleClear = () => {
    reset({
      firstName: '',
      lastName: '',
      email: '',
      mobileNo: '',
      address: {
        fullName: '',
        address: '',
        city: '',
        state: '',
        country: '',
        zip: '',
        mobileNo: '',
        gst: '',
        pancard: '',
        isDefault: false,
      },
    })

    lastLookedUpEmailRef.current = ''
    lastLookedUpGSTRef.current = ''
    setIsAutoFilled(false)
    dispatch(clearGSTData())
    if (typeof onClearForm === 'function') {
      onClearForm()
    }
  }

  return (
    <div className="space-y-6">
      <div className="border-b-2 pb-3 border-cyan-400">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      </div>

      <FormProvider {...methods}>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit((data) => {
              onSubmit(data)
            })(e)
          }}
          className="space-y-6"
        >
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h1 className="font-xl mt-4 mb-4 font-bold">User Details</h1>

            <hr className="mb-7" />

            <FormAdminInputRow
              name="firstName"
              label="First Name"
              type="text"
              required
            />

            <FormAdminInputRow
              name="lastName"
              label="Last Name"
              type="text"
              required
            />

            <div className="text-lg text-white mb-3 bg-blue-500 inline-block px-2 py-1 rounded">
              If user exists, enter email to auto-fill.
            </div>
            <FormAdminInputRow name="email" label="Email" type="email" />

            {lookingUpByEmail && (
              <div className="text-sm text-gray-500 -mt-2 mb-2">
                Looking up user by email...
              </div>
            )}

            <FormAdminInputRow name="mobileNo" label="Mobile Number" />
            <hr />
            <h1 className="font-xl mt-4 mb-4 font-bold">
              Shipping Address Details
            </h1>

            <div className="text-lg text-white mb-3 bg-blue-500 inline-block px-2 py-1 rounded">
              If user have GST, enter GST number to auto-fill.
            </div>
            <FormAdminInputRow
              name="address.gst"
              label="GST Number"
              type="text"
            />

            {gstLoading && (
              <div className="text-sm text-gray-500 -mt-2 mb-2">
                Verifying GST number...
              </div>
            )}
            {gstError && (
              <div className="text-sm text-red-600 -mt-2 mb-2">{gstError}</div>
            )}
            {verifiedData?.data && (
              <div className="text-sm text-green-600 -mt-2 mb-2">
                GST verified successfully! Auto-filled user data.
              </div>
            )}

            <FormAdminInputRow
              name="address.fullName"
              label="Full Name"
              type="text"
              required
            />

            <FormAdminInputRow
              name="address.address"
              label="Address"
              type="text"
              required
            />

            <FormAdminInputRow
              name="address.city"
              label="City"
              type="text"
              required
            />

            <FormAdminInputRow
              name="address.state"
              label="State"
              type="text"
              required
            />

            <FormAdminInputRow
              name="address.country"
              label="County"
              type="text"
            />

            <FormAdminInputRow
              name="address.zip"
              label="Zip Code"
              type="text"
              required
            />

            <FormAdminInputRow
              name="address.mobileNo"
              label="Mobile Number"
              type="text"
              required
            />

            <FormAdminInputRow
              name="address.pancard"
              label="Pancard"
              type="text"
            />

            <FormAdminCheckbox
              label="Default Address"
              name="address.isDefault"
            />
          </div>

          <div className="flex justify-end items-center mt-6">
            <div className="flex space-x-4">
              <button
                type="button"
                className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                onClick={handleClear}
              >
                Clear Form
              </button>

              <button
                type="submit"
                disabled={submitting || isAutoFilled}
                className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting
                  ? 'Submitting...'
                  : isAutoFilled
                    ? 'Auto-filled data'
                    : isEditMode
                      ? 'Update'
                      : 'Submit'}
              </button>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}
