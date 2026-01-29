import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import guestAuthReducer from '../features/auth/guestAuthSlice'
import productsReducer from '../features/products/productsSlice'
import productDetailsReducer from '../features/products/productDetailsSlice'
import categoryDetailsReducer from '../features/categories/categoryDetailsSlice'
import categoriesReducer from '../features/categories/categoriesSlice'
import userReducer from '../features/user/userSlice'
import shippingAddressReducer from '../features/shippingAddress/shippingAddressSlice'
import shippingReducer from '../features/shipping-method/shippingMethodSlice'
import orderReducer from '../features/order/orderSlice'
import attributesReducer from '../features/attributes/attributesSlice'
import couponsReducer from '../features/coupons/couponsSlice'
import customersReducer from '../features/customers/customersSlice'
import orderStatusReducer from '../features/orderStatus/orderStatusSlice'
import reviewsReducer from '../features/reviews/reviewsSlice'
import stockReducer from '../features/stock/stockSlice'
import caratReducer from '../features/carat/caratSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    guestAuth: guestAuthReducer,
    products: productsReducer,
    productDetails: productDetailsReducer,
    categoryDetails: categoryDetailsReducer,
    categories: categoriesReducer,
    user: userReducer,
    shippingAddress: shippingAddressReducer,
    shipping: shippingReducer,
    order: orderReducer,
    attributes: attributesReducer,
    coupons: couponsReducer,
    customers: customersReducer,
    orderStatus: orderStatusReducer,
    reviews: reviewsReducer,
    stock: stockReducer,
    carat: caratReducer,
  },
})
