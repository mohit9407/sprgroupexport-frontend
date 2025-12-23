import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import productsReducer from '../features/products/productsSlice'
import productDetailsReducer from '../features/products/productDetailsSlice'
import categoryDetailsReducer from '../features/categories/categoryDetailsSlice'
import categoriesReducer from '../features/categories/categoriesSlice'
import userReducer from '../features/user/userSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productsReducer,
    productDetails: productDetailsReducer,
    categoryDetails: categoryDetailsReducer,
    categories: categoriesReducer,
    user: userReducer,
  },
})
