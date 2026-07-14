import { api } from '@/lib/axios'

/**
 * Creates a payment link using Skydo API (via backend proxy)
 * @param {Object} paymentData - Payment link data
 * @param {string} paymentData.clientName - Client name
 * @param {string} paymentData.country - Country name
 * @param {string} paymentData.currency - Currency code (e.g., USD)
 * @param {number} paymentData.invoiceAmount - Invoice amount
 * @param {string} paymentData.invoiceNumber - Invoice number
 * @param {string} paymentData.description - Payment description
 * @param {Array<string>} paymentData.allowedMethods - Allowed payment methods (e.g., ["ACH_DEBIT"])
 * @returns {Promise<Object>} Skydo payment link response
 */
export const createSkydoPaymentLink = async (paymentData) => {
  try {
    const payload = {
      installinkId: paymentData.installinkId || null,
      clientName: paymentData.clientName,
      country: paymentData.country,
      currency: paymentData.currency,
      invoiceAmount: paymentData.invoiceAmount,
      invoiceNumber: paymentData.invoiceNumber,
      description: paymentData.description,
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
