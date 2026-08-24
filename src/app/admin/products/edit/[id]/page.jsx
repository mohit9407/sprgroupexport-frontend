'use client'

import { Suspense } from 'react'
import { useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchProductDetails,
  clearProductDetails,
} from '@/features/products/productDetailsSlice'
import ProductFormPage from '@/components/admin/ProductFormPage/ProductFormPage'
import { fetchAllCategories } from '@/features/categories/categoriesSlice'
import { getProductsListReturnPath } from '@/utils/adminRouteUtils'

function EditProductContent() {
  const { id } = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useDispatch()
  const productsListPath = getProductsListReturnPath(searchParams)

  const {
    data: product,
    status,
    error,
  } = useSelector((state) => state.productDetails)

  const { categories } = useSelector((state) => state.categories)

  useEffect(() => {
    if (!id) {
      router.push(productsListPath)
      return
    }

    dispatch(fetchProductDetails(id))

    // Clean up when component unmounts
    return () => {
      dispatch(clearProductDetails())
    }
  }, [dispatch, id, router, productsListPath])

  useEffect(() => {
    if (!categories || categories.length === 0) {
      dispatch(fetchAllCategories())
    }
  }, [dispatch, categories])

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Error loading product: {error}
              </p>
              <button
                onClick={() => router.push(productsListPath)}
                className="mt-2 px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 text-sm"
              >
                Back to Products
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center p-8 bg-white rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Product Not Found
          </h3>
          <p className="text-gray-600 mb-6">
            The requested product could not be found or may have been removed.
          </p>
          <button
            onClick={() => router.push(productsListPath)}
            className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600"
          >
            Back to Products
          </button>
        </div>
      </div>
    )
  }

  // Prepare default values for the form
  const defaultValues = {
    type: product.type || 'simple',
    sku: product.sku || '',
    category: product.category?._id || product.category || '',
    isFeatured: product.isFeatured || false,
    status: product.status || 'active',
    price: product.price || 0,
    minOrderLimit: product.minOrderLimit || 1,
    stock: product.stock || 0,
    productModel: product.productModel || '',
    carat: product.carat || '',
    gram: product.gram || 0,
    userExtra: product.userExtra || 0,
    color: product.color || '',
    size: product.size || '',
    diamondCarat: product.diamondCarat || '',
    gemstoneKt: product.gemstoneKt || '',
    goldColor: product.goldColor || '',
    diamondColor: product.diamondColor || '',
    diamondClarity: product.diamondClarity || '',
    diamondSize: product.diamondSize || '',
    totalWeight: product.totalWeight || 0,
    totalNoOfDiamonds: product.totalNoOfDiamonds || 0,
    diamondPrice: product.diamondPrice || 0,
    ornamentSize: product.ornamentSize || '',
    grossWeight: product.grossWeight || 0,
    netWeight: product.netWeight || 0,
    image: product.image || '',
    videoEmbedLink: product.videoEmbedLink || '',
    productName: product.productName || product.name || '',
    description: product.description || '',
    sideImages: product.sideImages || '',
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <ProductFormPage
        mode="edit"
        productId={id}
        defaultValues={defaultValues}
        title={`Edit Product: ${product.productName}`}
      />
    </div>
  )
}

export default function EditProductPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
        </div>
      }
    >
      <EditProductContent />
    </Suspense>
  )
}
