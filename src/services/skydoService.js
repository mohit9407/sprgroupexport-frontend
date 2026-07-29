import { api } from '@/lib/axios'

/**
 * Creates a payment link using Skydo API (via backend proxy).
 * Payload shape matches Skydo dashboard create-payment-link.
 */
export const createSkydoPaymentLink = async (paymentData) => {
  try {
    const payload = {
      importerId: null,
      clientName: paymentData.clientName,
      country: paymentData.country,
      currency: paymentData.currency,
      invoiceAmount: paymentData.invoiceAmount,
      invoiceNumber: paymentData.invoiceNumber ?? '',
      description: paymentData.description ?? '',
      passFeeToClient: false,
      allowedMethods: paymentData.allowedMethods || ['ACH_DEBIT'],
    }

    const response = await api.post(
      '/payments/skydo/create-payment-link',
      payload,
    )
    return response.data
  } catch (error) {
    console.error('Skydo API Error:', error)
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        'Failed to create Skydo payment link',
    )
  }
}

export const skydoService = {
  createSkydoPaymentLink,
}
