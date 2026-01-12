import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { customerAddressService } from './customersService'

export const getAllCustomers = createAsyncThunk(
  'customer/allCustomers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await customerAddressService.getAllUsers()
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.message || 'Fetch all customers failed',
      )
    }
  },
)
export const getCustomer = createAsyncThunk(
  'customer/geyCustomer',
  async ({ id }, { rejectWithValue, dispatch }) => {
    try {
      const response = await customerAddressService.getCustomer(id)
      dispatch(getAllCustomers())
      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Unable to fetch customer details',
      )
    }
  },
)

export const addNewCustomer = createAsyncThunk(
  'customer/addNewCustomer',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await customerAddressService.addNewCustomer()
      dispatch(getAllCustomers())
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Unable to add new customer',
      )
    }
  },
)

export const updateCustomer = createAsyncThunk(
  'customer/updateCustomer',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await customerAddressService.updateCustomer(id, data)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Unable to update customer details',
      )
    }
  },
)

export const getCustomerAddress = createAsyncThunk(
  'customer/customerAddress',
  async ({ userId }, { rejectWithValue }) => {
    try {
      const response = await customerAddressService.getCustomerAddress(userId)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Unable to fetch customer address',
      )
    }
  },
)

export const addCustomerAddress = createAsyncThunk(
  'customer/addCustomerAddress',
  async ({ userId, data }, { rejectWithValue, dispatch }) => {
    try {
      const response = await customerAddressService.addCustomerAddress(
        userId,
        data,
      )
      dispatch(getCustomerAddress({ userId }))
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Unable to add customer address',
      )
    }
  },
)

export const updateCustomerAddress = createAsyncThunk(
  'customer/uodateCustomerAddress',
  async ({ userId, addressId, data }, { rejectWithValue, dispatch }) => {
    try {
      const response = await customerAddressService.updateCustomerAddress(
        userId,
        addressId,
        data,
      )
      dispatch(getCustomerAddress({ userId }))
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Unable to update customer address',
      )
    }
  },
)

export const deleteCustomerAddress = createAsyncThunk(
  'customer/deleteCustomerAddress',
  async ({ id }, { rejectWithValue, dispatch }) => {
    try {
      const response = await customerAddressService.deleteCustomerAddress(id)
      dispatch(getCustomerAddress({ userId }))
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Unable to delete customer address',
      )
    }
  },
)

const customersSlice = createSlice({
  name: 'customers',
  initialState: {
    allCustomers: {
      data: null,
      pagination: null,
    },
    getCustomer: {
      data: null,
    },
    addNewCustomer: {
      data: null,
    },
    updateCustomer: {
      data: null,
    },
    addresses: {
      data: null,
    },
    addAddress: null,
    updateAddress: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllCustomers.pending, (state) => {
        state.allCustomers.isLoading = true
      })
      .addCase(getAllCustomers.fulfilled, (state, action) => {
        state.allCustomers.isLoading = false
        state.allCustomers.isSuccess = true
        state.allCustomers.data = action.payload.data
        state.allCustomers.pagination = action.payload.pagination
        state.allCustomers.message = action.payload.message
      })
      .addCase(getAllCustomers.rejected, (state, action) => {
        state.allCustomers.isLoading = false
        state.allCustomers.isError = true
        state.allCustomers.message = action.payload
      })
      .addCase(getCustomer.pending, (state) => {
        state.getCustomer.isLoading = true
      })
      .addCase(getCustomer.fulfilled, (state, action) => {
        state.getCustomer.isLoading = false
        state.getCustomer.isSuccess = true
        state.getCustomer.data = action.payload
        state.getCustomer.message = 'Customer fetched Successfully'
      })
      .addCase(getCustomer.rejected, (state, action) => {
        state.getCustomer.isLoading = false
        state.getCustomer.isError = true
        state.getCustomer.message = action.payload
      })
      .addCase(addNewCustomer.pending, (state) => {
        state.addNewCustomer.isLoading = true
      })
      .addCase(addNewCustomer.fulfilled, (state) => {
        state.addNewCustomer.isLoading = false
        state.addNewCustomer.isSuccess = true
        state.addNewCustomer.message = 'Customer Added Successfully'
      })
      .addCase(addNewCustomer.rejected, (state, action) => {
        state.addNewCustomer.isLoading = false
        state.addNewCustomer.isError = true
        state.addNewCustomer.message = action.payload
      })
      .addCase(updateCustomer.pending, (state) => {
        state.updateCustomer.isLoading = true
      })
      .addCase(updateCustomer.fulfilled, (state) => {
        state.updateCustomer.isLoading = false
        if (customerIndex !== undefined) {
          state.updateCustomer.isSuccess = true
          state.updateCustomer.message = 'Customer updated Successfully'
        }
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.updateCustomer.isLoading = false
        state.updateCustomer.isError = true
        state.updateCustomer.message = action.payload
      })
      .addCase(getCustomerAddress.pending, (state) => {
        state.addresses.isLoading = true
      })
      .addCase(getCustomerAddress.fulfilled, (state, action) => {
        state.addresses.isLoading = false
        state.addresses.isSuccess = true
        state.addresses.data = {
          ...(state?.addresses?.data || {}),
          [action.meta.arg.userId]: action.payload,
        }
      })
      .addCase(getCustomerAddress.rejected, (state, action) => {
        state.addresses.isLoading = false
        state.addresses.isError = true
        state.addresses.message = action.payload
      })
      .addCase(addCustomerAddress.pending, (state) => {
        state.isLoading = true
      })
      .addCase(addCustomerAddress.fulfilled, (state) => {
        state.addAddress.isLoading = false
        state.addAddress.isSuccess = true
      })
      .addCase(addCustomerAddress.rejected, (state, action) => {
        state.addAddress.isLoading = false
        state.addAddress.isError = true
        state.addAddress.message = action.payload
      })
      .addCase(updateCustomerAddress.pending, (state) => {
        state.updateAddress.isLoading = true
      })
      .addCase(updateCustomerAddress.fulfilled, (state) => {
        state.updateAddress.isLoading = false
        state.updateAddress.isSuccess = true
      })
      .addCase(updateCustomerAddress.rejected, (state, action) => {
        state.updateAddress.isLoading = false
        state.updateAddress.isError = true
        state.updateAddress.message = action.payload
      })
      .addCase(deleteCustomerAddress.pending, (state) => {
        state.deleteAddress.isLoading = true
      })
      .addCase(deleteCustomerAddress.fulfilled, (state) => {
        state.deleteAddress.isLoading = false
        state.deleteAddress.isSuccess = true
      })
      .addCase(deleteCustomerAddress.rejected, (state, action) => {
        state.deleteAddress.isLoading = false
        state.deleteAddress.isError = true
        state.deleteAddress.message = action.payload
      })
  },
})

export default customersSlice.reducer
