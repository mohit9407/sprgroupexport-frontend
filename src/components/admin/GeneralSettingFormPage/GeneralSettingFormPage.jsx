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
import { yupResolver } from '@hookform/resolvers/yup'
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
      uploadYourDesign: defaultValues?.uploadYourDesign ?? undefined,
      productCategorySectionText:
        defaultValues?.topSellingSectionText ?? undefined,
      newArrivalSectionText: defaultValues?.newArrivalSectionText ?? undefined,
      flashSaleSectionText: defaultValues?.flashSaleSectionText ?? undefined,
      specialProductSectionText:
        defaultValues?.specialProductSectionText ?? undefined,
      welcomeStoreSectionText:
        defaultValues?.welcomeStoreSectionText ?? undefined,
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
          defaultValues?.topSellingSectionText ?? undefined,
        newArrivalSectionText:
          defaultValues?.newArrivalSectionText ?? undefined,
        flashSaleSectionText: defaultValues?.flashSaleSectionText ?? undefined,
        specialProductSectionText:
          defaultValues?.specialProductSectionText ?? undefined,
        welcomeStoreSectionText:
          defaultValues?.welcomeStoreSectionText ?? undefined,
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
              onSubmit(data)
            })(e)
          }}
          className="space-y-6"
        >
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <FormAdminRadioGroup
              name="environment"
              label="Web/App Environment"
              options={[
                { label: 'Maintenance', value: 'Maintenance' },
                { label: 'Production', value: 'Production' },
                { label: 'local', value: 'local' },
              ]}
            />
            <FormAdminInputRow
              name="maintenanceText"
              label="Maintenance Text"
              type="string"
            />

            <FormAdminInputRow
              name="websiteLink"
              label="Website Link"
              type="string"
            />

            <FormAdminInputRow name="appName" label="App Name" type="string" />
            <FormAdminInputRow
              name="newProductDuration"
              label="New Product Duration"
              type="number"
            />
            <hr />
            <br />
            <h1 className="pb-3 font-bold">Google Map API</h1>
            <hr />
            <br />

            <FormAdminInputRow
              name="googleMapApi"
              label="Google Map Api"
              type="string"
            />
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

            <FormAdminInputRow name="latitude" label="Latitude" type="string" />
            <FormAdminInputRow
              name="longitude"
              label="Longitude"
              type="string"
            />
            <hr />
            <br />
            <h1 className="pb-3 font-bold">Google Captcha</h1>
            <hr />
            <br />
            <FormAdminInputRow
              name="googleCaptchaKey"
              label="Google Captcha Key"
              type="string"
            />
            <FormAdminInputRow
              name="googleCaptchaSecret"
              label="Google Captcha Secret"
              type="string"
            />
            <hr />
            <br />
            <h1 className="pb-3 font-bold">Upload Your Design</h1>
            <hr />
            <br />
            <FormAdminInputRow
              name="uploadYourDesign"
              label="Upload Your Design"
              type="string"
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
