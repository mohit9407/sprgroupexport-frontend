import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import shippingAddressService, {
  updateShippingAddress,
} from './shippingAddressService'

// Get user from local storage
const user = JSON.parse(localStorage.getItem('user'))

// Initial state
const initialState = {
  addresses: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
}

// Add shipping address
export const addAddress = createAsyncThunk(
  'shippingAddress/add',
  async (addressData, thunkAPI) => {
    try {
      const response =
        await shippingAddressService.addShippingAddress(addressData)
      return response
    } catch (error) {
      console.error('Error in addAddress:', error)
      return thunkAPI.rejectWithValue(error.message)
    }
  },
)

// Get shipping addresses
export const getAddresses = createAsyncThunk(
  'shippingAddress/getAll',
  async (_, thunkAPI) => {
    try {
      return await shippingAddressService.getShippingAddresses()
    } catch (error) {
      console.error('Error in getAddresses:', error)
      return thunkAPI.rejectWithValue(error.message)
    }
  },
)

// Set default shipping address
export const setDefaultAddress = createAsyncThunk(
  'shippingAddress/setDefault',
  async (addressId, thunkAPI) => {
    try {
      const response = await shippingAddressService.setDefaultAddress(addressId)
      return { addressId, data: response.data }
    } catch (error) {
      console.error('Error in setDefaultAddress:', error)
      return thunkAPI.rejectWithValue(error.message)
    }
  },
)

// Delete shipping address
export const deleteAddress = createAsyncThunk(
  'shippingAddress/delete',
  async (addressId, thunkAPI) => {
    try {
      await shippingAddressService.deleteShippingAddress(addressId)
      return addressId
    } catch (error) {
      console.error('Error in deleteAddress:', error)
      return thunkAPI.rejectWithValue(error.message)
    }
  },
)

// Update shipping address
export const updateAddress = createAsyncThunk(
  'shippingAddress/update',
  async ({ id, ...addressData }, thunkAPI) => {
    try {
      const response = await shippingAddressService.updateShippingAddress({
        id,
        ...addressData,
      })
      return { id, ...response.data }
    } catch (error) {
      console.error('Error in updateAddress:', error)
      return thunkAPI.rejectWithValue(error.message)
    }
  },
)

export const shippingAddressSlice = createSlice({
  name: 'shippingAddress',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false
      state.isSuccess = false
      state.isError = false
      state.message = ''
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addAddress.pending, (state) => {
        state.isLoading = true
      })
      .addCase(addAddress.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.addresses = [...state.addresses, action.payload]
        state.message = 'Address added successfully'
      })
      .addCase(addAddress.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      .addCase(getAddresses.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getAddresses.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.addresses = action.payload.data || []
        state.message = 'Addresses loaded successfully'
      })
      .addCase(getAddresses.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      .addCase(setDefaultAddress.pending, (state) => {
        state.isLoading = true
      })
      .addCase(setDefaultAddress.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        // Update the default status for all addresses
        state.addresses = state.addresses.map((address) => ({
          ...address,
          isDefault: address._id === action.payload.addressId,
        }))
        state.message = 'Default address updated successfully'
      })
      .addCase(setDefaultAddress.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      .addCase(deleteAddress.pending, (state) => {
        state.isLoading = true
      })
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.addresses = state.addresses.filter(
          (address) => address._id !== action.payload,
        )
        state.message = 'Address deleted successfully'
      })
      .addCase(deleteAddress.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      .addCase(updateAddress.pending, (state) => {
        state.isLoading = true
      })
      .addCase(updateAddress.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.addresses = state.addresses.map((address) =>
          address._id === action.payload._id ? action.payload : address,
        )
        state.message = 'Address updated successfully'
      })
      .addCase(updateAddress.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
  },
})

export const { reset } = shippingAddressSlice.actions
export default shippingAddressSlice.reducer
