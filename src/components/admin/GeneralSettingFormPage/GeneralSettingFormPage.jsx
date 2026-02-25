'use client'

import React, { useEffect } from 'react'
import { FormAdminInputRow } from '../AdminInputRow'
import { useRouter } from 'next/navigation'
import {
  FormProvider,
  useForm,
  useFormContext,
  Controller,
} from 'react-hook-form'
import AdminTextAreaRow from '@/components/AdminTextAreaRow/AdminTextAreaRow'
import { FormAdminRadioGroup } from '../AdminRadioGroup'

export default function GeneralSettingFormPage({
  mode = 'add',
  defaultValues,
  title = 'Settings',
  onSubmit,
}) {
  const isEditMode = mode === 'edit'

  const methods = useForm({
    defaultValues: {
      _id: defaultValues?._id ?? undefined,
      environment: defaultValues?.environment ?? undefined,
      maintenanceText: defaultValues?.maintenanceText ?? undefined,
      websiteLink: defaultValues?.websiteLink ?? undefined,
      appName: defaultValues?.appName ?? undefined,
      newProductDuration: defaultValues?.newProductDuration ?? undefined,
      googleMapApi: defaultValues?.googleMapApi ?? undefined,
      contactUsEmail: defaultValues?.contactUsEmail ?? undefined,
      orderEmail: defaultValues?.orderEmail ?? undefined,
      freeShippingOnMinOrderPrice:
        defaultValues?.freeShippingOnMinOrderPrice ?? undefined,
      minOrderPrice: defaultValues?.minOrderPrice ?? undefined,
      phoneNumber: defaultValues?.phoneNumber ?? undefined,
      address: defaultValues?.address ?? undefined,
      city: defaultValues?.city ?? undefined,
      state: defaultValues?.state ?? undefined,
      zip: defaultValues?.zip ?? undefined,
      country: defaultValues?.country ?? undefined,
      latitude: defaultValues?.latitude ?? undefined,
      longitude: defaultValues?.longitude ?? undefined,
      googleCaptchaKey: defaultValues?.googleCaptchaKey ?? undefined,
      googleCaptchaSecret: defaultValues?.googleCaptchaSecret ?? undefined,
      gstSecretKey: defaultValues?.gstSecretKey ?? undefined,
      uploadYourDesign: defaultValues?.uploadYourDesign ?? undefined,
      productCategorySectionText:
        defaultValues?.topSellingSectionText ?? undefined,
      newArrivalSectionText: defaultValues?.newArrivalSectionText ?? undefined,
      flashSaleSectionText: defaultValues?.flashSaleSectionText ?? undefined,
      specialProductSectionText:
        defaultValues?.specialProductSectionText ?? undefined,
      welcomeStoreSectionText:
        defaultValues?.welcomeStoreSectionText ?? undefined,
      twilioAccountSid: defaultValues?.twilioAccountSid ?? undefined,
      twilioAuthToken: defaultValues?.twilioAuthToken ?? undefined,
      twilioPhone: defaultValues?.twilioPhone ?? undefined,
      smsEnabled: defaultValues?.smsEnabled !== false ? 'yes' : 'no',
      gstVerificationEnabled:
        defaultValues?.gstVerificationEnabled !== false ? 'yes' : 'no',
    },
  })

  const { reset, handleSubmit } = methods

  useEffect(() => {
    if (defaultValues) {
      reset({
        _id: defaultValues?._id ?? undefined,
        environment: defaultValues?.environment ?? undefined,
        maintenanceText: defaultValues?.maintenanceText ?? undefined,
        websiteLink: defaultValues?.websiteLink ?? undefined,
        appName: defaultValues?.appName ?? undefined,
        newProductDuration: defaultValues?.newProductDuration ?? undefined,
        googleMapApi: defaultValues?.googleMapApi ?? undefined,
        contactUsEmail: defaultValues?.contactUsEmail ?? undefined,
        orderEmail: defaultValues?.orderEmail ?? undefined,
        freeShippingOnMinOrderPrice:
          defaultValues?.freeShippingOnMinOrderPrice ?? undefined,
        minOrderPrice: defaultValues?.minOrderPrice ?? undefined,
        phoneNumber: defaultValues?.phoneNumber ?? undefined,
        address: defaultValues?.address ?? undefined,
        city: defaultValues?.city ?? undefined,
        state: defaultValues?.state ?? undefined,
        zip: defaultValues?.zip ?? undefined,
        country: defaultValues?.country ?? undefined,
        latitude: defaultValues?.latitude ?? undefined,
        longitude: defaultValues?.longitude ?? undefined,
        googleCaptchaKey: defaultValues?.googleCaptchaKey ?? undefined,
        googleCaptchaSecret: defaultValues?.googleCaptchaSecret ?? undefined,
        uploadYourDesign: defaultValues?.uploadYourDesign ?? undefined,
        productCategorySectionText:
          defaultValues?.productCategorySectionText ?? undefined,
        topSellingSectionText:
          defaultValues?.topSellingSectionText ?? undefined,
        newArrivalSectionText:
          defaultValues?.newArrivalSectionText ?? undefined,
        flashSaleSectionText: defaultValues?.flashSaleSectionText ?? undefined,
        specialProductSectionText:
          defaultValues?.specialProductSectionText ?? undefined,
        welcomeStoreSectionText:
          defaultValues?.welcomeStoreSectionText ?? undefined,
        gstSecretKey: defaultValues?.gstSecretKey ?? undefined,
        twilioAccountSid: defaultValues?.twilioAccountSid ?? undefined,
        twilioAuthToken: defaultValues?.twilioAuthToken ?? undefined,
        twilioPhone: defaultValues?.twilioPhone ?? undefined,
        smsEnabled: defaultValues?.smsEnabled !== false ? 'yes' : 'no',
        gstVerificationEnabled:
          defaultValues?.gstVerificationEnabled !== false ? 'yes' : 'no',
      })
    }
  }, [defaultValues, reset])

  return (
    <div className="space-y-6">
      <div className="border-b-2 pb-3 border-cyan-400">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      </div>

      <h2 className="font-bold">General Settings</h2>

      <FormProvider {...methods}>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit((data) => {
              const payload = {
                ...data,
                smsEnabled: data.smsEnabled === 'yes',
                gstVerificationEnabled: data.gstVerificationEnabled === 'yes',
              }
              onSubmit(payload)
            })(e)
          }}
          className="space-y-6"
        >
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <hr />
            <br />
            <h1 className="pb-3 font-bold">Inquery Email</h1>
            <hr />
            <br />

            <FormAdminInputRow
              name="contactUsEmail"
              label="Contact Us Email"
              type="string"
            />

            <hr />
            <br />
            <h1 className="pb-3 font-bold">Order Email</h1>
            <hr />
            <br />

            <FormAdminInputRow
              name="orderEmail"
              label="Order Email"
              type="string"
            />

            <hr />
            <br />
            <h1 className="pb-3 font-bold">SMS Service Setting</h1>
            <hr />
            <br />

            <FormAdminInputRow
              name="twilioAccountSid"
              label="Twilio Account Sid"
              type="string"
            />
            <FormAdminInputRow
              name="twilioAuthToken"
              label="Twilio Auth Token"
              type="string"
            />
            <FormAdminInputRow
              name="twilioPhone"
              label="Twilio Phone"
              type="string"
            />
            <FormAdminRadioGroup
              name="smsEnabled"
              label="SMS Enabled"
              options={[
                { label: 'Active', value: 'yes' },
                { label: 'InActive', value: 'no' },
              ]}
            />

            <hr />
            <br />
            <h1 className="pb-3 font-bold">Orders</h1>
            <hr />
            <br />
            <FormAdminInputRow
              name="freeShippingOnMinOrderPrice"
              label="Free Shipping On Min Order Price"
              type="string"
            />

            <FormAdminInputRow
              name="minOrderPrice"
              label="Min Order Price"
              type="number"
            />
            <hr />
            <br />
            <h1 className="pb-3 font-bold">Our Info</h1>
            <hr />
            <br />
            <FormAdminInputRow
              name="phoneNumber"
              label="Phone Number"
              type="string"
            />

            <FormAdminInputRow name="address" label="Address" type="string" />

            <FormAdminInputRow name="city" label="City" type="string" />

            <FormAdminInputRow name="state" label="State" type="string" />

            <FormAdminInputRow name="zip" label="Zip" type="string" />

            <FormAdminInputRow name="country" label="Country" type="string" />

            <hr />
            <br />
            <h1 className="pb-3 font-bold">GST Settings</h1>
            <hr />
            <br />
            <FormAdminInputRow
              name="gstSecretKey"
              label="GST Secret Key"
              type="string"
              helpText="Enter your GST secret key for verification"
            />
            <FormAdminRadioGroup
              name="gstVerificationEnabled"
              label="GST Verification Enabled"
              options={[
                { label: 'Active', value: 'yes' },
                { label: 'InActive', value: 'no' },
              ]}
            />
            <hr />
            <br />
            <h1 className="pb-3 font-bold">Site Text</h1>
            <hr />
            <br />
            <Controller
              name="productCategorySectionText"
              control={methods.control}
              render={({ field }) => (
                <AdminTextAreaRow
                  name="productCategorySectionText"
                  label="Product Category Section Text"
                  placeholder="Enter Product Category Section Text"
                  helpText="Enter Product Category Section Text"
                  rows={8}
                  value={field.value || ''}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              name="topSellingSectionText"
              control={methods.control}
              render={({ field }) => (
                <AdminTextAreaRow
                  name="topSellingSectionText"
                  label="Top Selling Section Text"
                  placeholder="Top Selling Section Text"
                  helpText="Top Selling Section Text"
                  rows={8}
                  value={field.value || ''}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              name="newArrivalSectionText"
              control={methods.control}
              render={({ field }) => (
                <AdminTextAreaRow
                  name="newArrivalSectionText"
                  label="New Arrival Section Text"
                  placeholder="New Arrival Section Text"
                  helpText="New Arrival Section Text"
                  rows={8}
                  value={field.value || ''}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              name="flashSaleSectionText"
              control={methods.control}
              render={({ field }) => (
                <AdminTextAreaRow
                  name="flashSaleSectionText"
                  label="Flash Sale Section Text"
                  placeholder="Flash Sale Section Text"
                  helpText="Flash Sale Section Text"
                  rows={8}
                  value={field.value || ''}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              name="specialProductSectionText"
              control={methods.control}
              render={({ field }) => (
                <AdminTextAreaRow
                  name="specialProductSectionText"
                  label="Special Product Section Text"
                  placeholder="Special Product Section Text"
                  helpText="Special Product Section Text"
                  rows={8}
                  value={field.value || ''}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              name="welcomeStoreSectionText"
              control={methods.control}
              render={({ field }) => (
                <AdminTextAreaRow
                  name="welcomeStoreSectionText"
                  label="Welcome Store Section Text"
                  placeholder="Welcome Store Section Text"
                  helpText="Welcome Store Section Text"
                  rows={8}
                  value={field.value || ''}
                  onChange={field.onChange}
                />
              )}
            />
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="submit"
              onClick={() =>
                console.log('Button clicked, form values:', methods.getValues())
              }
              className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
            >
              {isEditMode ? 'Update' : 'Submit'}
            </button>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}
