import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '@/lib/axios'

// Async thunk for submitting contact form
export const submitContactForm = createAsyncThunk(
  'contact/submitForm',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post('/contact/create', formData)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Something went wrong',
      )
    }
  },
)

// Async thunk for fetching contact messages with filtering, sorting and pagination
export const fetchContactMessages = createAsyncThunk(
  'contact/fetchMessages',
  async (params = {}, { rejectWithValue }) => {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params

    try {
      const response = await api.get('/contact/all-contacts-messages', {
        params: {
          page,
          limit,
          ...(status && { status }),
          ...(search && { search }),
          sortBy,
          sortOrder,
        },
      })
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch messages',
      )
    }
  },
)

// Async thunk for updating message status
export const updateMessageStatus = createAsyncThunk(
  'contact/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/contact/messages/${id}/status`, {
        status,
      })
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update message status',
      )
    }
  },
)

const contactSlice = createSlice({
  name: 'contact',
  initialState: {
    messages: [],
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      limit: 10,
    },
    filters: {
      status: '',
      search: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    },
    loading: false,
    error: null,
    success: false,
    submittedData: null,
  },
  reducers: {
    resetContactState: (state) => {
      state.loading = false
      state.success = false
      state.error = null
      state.submittedData = null
    },
    setFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      }
      state.pagination.currentPage = 1 // Reset to first page when filters change
    },
    setPage: (state, action) => {
      state.pagination.currentPage = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Submit Contact Form
      .addCase(submitContactForm.pending, (state) => {
        state.loading = true
        state.success = false
        state.error = null
      })
      .addCase(submitContactForm.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        state.submittedData = action.payload
      })
      .addCase(submitContactForm.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Failed to submit form'
      })

      // Fetch Contact Messages
      .addCase(fetchContactMessages.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchContactMessages.fulfilled, (state, action) => {
        state.loading = false
        // Handle both possible response structures
        const responseData = Array.isArray(action.payload)
          ? action.payload
          : action.payload.data || action.payload
        state.messages = responseData || []

        // If we have pagination data in the response, use it
        if (action.payload.meta) {
          state.pagination = {
            currentPage: action.payload.meta.currentPage || 1,
            totalPages: action.payload.meta.totalPages || 1,
            totalItems:
              action.payload.meta.totalItems ||
              (Array.isArray(responseData) ? responseData.length : 0),
            limit: action.payload.meta.itemsPerPage || 10,
          }
        } else if (Array.isArray(responseData)) {
          // If no pagination data, update count based on the array length
          state.pagination.totalItems = responseData.length
        }
      })
      .addCase(fetchContactMessages.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Update Message Status
      .addCase(updateMessageStatus.fulfilled, (state, action) => {
        const { _id, status } = action.payload
        const messageIndex = state.messages.findIndex((msg) => msg._id === _id)
        if (messageIndex !== -1) {
          state.messages[messageIndex].status = status
        }
      })
  },
})

export const { resetContactState, setFilters, setPage } = contactSlice.actions
export default contactSlice.reducer
