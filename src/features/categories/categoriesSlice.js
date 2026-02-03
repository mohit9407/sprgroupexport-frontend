import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '@/lib/axios'

const initialState = {
  allCategories: {
    data: [],
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 10,
    },
    isLoading: false,
    error: null,
  },
  status: 'idle',
  error: null,
}

export const fetchAllCategories = createAsyncThunk(
  'categories/fetchAllCategories',
  async (params = {}, { rejectWithValue }) => {
    try {
      // If no pagination parameters are provided, fetch all categories without pagination
      const shouldPaginate =
        params.page !== undefined || params.limit !== undefined

      let response
      if (shouldPaginate) {
        // For paginated requests, include the parameters
        response = await api.get('/category/get-all-categories', { params })

        // Ensure response has valid pagination data
        if (response.data && response.data.pagination) {
          response.data.pagination = {
            currentPage: response.data.pagination.currentPage || 1,
            totalPages: response.data.pagination.totalPages || 1,
            totalItems: response.data.pagination.totalItems || 0,
            itemsPerPage: response.data.pagination.itemsPerPage || 10,
          }
        }
      } else {
        // For non-paginated requests, fetch all categories
        response = await api.get('/category/get-all-categories')

        // If the response is an array, format it to match the expected structure
        if (Array.isArray(response.data)) {
          return {
            data: response.data,
            pagination: {
              currentPage: 1,
              totalPages: 1,
              totalItems: response.data.length,
              itemsPerPage: response.data.length,
            },
          }
        }

        // If response already has data array, return as is
        if (
          response.data &&
          response.data.data &&
          Array.isArray(response.data.data)
        ) {
          return response
        }
      }

      return response
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch categories',
      )
    }
  },
)

export const createCategory = createAsyncThunk(
  'categories/createCategory',
  async (categoryData, { rejectWithValue }) => {
    try {
      const response = await api.post('/category/create', categoryData, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create category',
      )
    }
  },
)

export const updateCategory = createAsyncThunk(
  'categories/updateCategory',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/category/update/${id}`, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update category',
      )
    }
  },
)

export const deleteCategory = createAsyncThunk(
  'categories/deleteCategory',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/category/delete/${id}`)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete category',
      )
    }
  },
)

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearCategories: (state) => {
      state.categories = []
      state.status = 'idle'
      state.error = null
    },
    resetCategoryStatus: (state) => {
      state.status = 'idle'
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllCategories.pending, (state) => {
        state.allCategories.isLoading = true
        state.allCategories.error = null
      })
      .addCase(fetchAllCategories.fulfilled, (state, action) => {
        state.allCategories.isLoading = false
        state.allCategories.data = action.payload.data || []
        if (action.payload.pagination) {
          state.allCategories.pagination = {
            ...state.allCategories.pagination,
            ...action.payload.pagination,
          }
        }
      })
      .addCase(fetchAllCategories.rejected, (state, action) => {
        state.allCategories.isLoading = false
        state.allCategories.error = action.payload
      })
      .addCase(createCategory.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.allCategories.data = [action.payload, ...state.allCategories.data]
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(updateCategory.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const updatedCategory = action.payload
        state.allCategories.data = state.allCategories.data.map((category) =>
          category._id === updatedCategory._id ? updatedCategory : category,
        )
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(deleteCategory.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.allCategories.data = state.allCategories.data.filter(
          (category) => category._id !== action.payload._id,
        )
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
  },
})

export const { clearCategories, resetCategoryStatus } = categoriesSlice.actions
export default categoriesSlice.reducer

export const selectAllCategories = (state) => ({
  data: state.categories.allCategories.data,
  pagination: state.categories.allCategories.pagination,
  isLoading: state.categories.allCategories.isLoading,
  error: state.categories.allCategories.error,
})

export const selectCategoriesStatus = (state) => state.categories.status
export const selectCategoriesError = (state) => state.categories.error
