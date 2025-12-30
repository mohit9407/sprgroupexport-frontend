import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import guestAuthReducer from '../features/auth/guestAuthSlice'
import productsReducer from '../features/products/productsSlice'
import productDetailsReducer from '../features/products/productDetailsSlice'
import categoryDetailsReducer from '../features/categories/categoryDetailsSlice'
import categoriesReducer from '../features/categories/categoriesSlice'
import userReducer from '../features/user/userSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    guestAuth: guestAuthReducer,
    products: productsReducer,
    productDetails: productDetailsReducer,
    categoryDetails: categoryDetailsReducer,
    categories: categoriesReducer,
    user: userReducer,
  },
})
