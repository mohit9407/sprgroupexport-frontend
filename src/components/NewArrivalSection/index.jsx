import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import ProductCard from '../ProductCard'
import Link from 'next/link'
import { fetchProducts } from '@/features/products/productsSlice'
import { toast } from 'react-hot-toast'

const NewArrivalSection = () => {
  const dispatch = useDispatch()
  const {
    items: products = [],
    status = 'idle',
    error,
  } = useSelector((state) => state.products || {})

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProducts())
    }
  }, [status, dispatch])

  // Map API response to match ProductCard props
  const mappedProducts = (products || []).map((product) => ({
    id: product._id,
    image: product.image || '/images/placeholder-product.png',
    brand: product.brand || 'Unknown Brand',
    name: product.productModel || product.name || 'Unnamed Product',
    price: product.price || 0,
    isNew: product.isNew || false,
    isVideo: product.isVideo || false,
    flashSale: product.flashSale || false,
    special: product.special || false,
    discount: product.discount || null,
    status: product.status || 'in-stock',
    minOrderLimit: product.minOrderLimit || 1,
    sideImages: product.sideImages || [],
    categoryId: product.category,
    ...product, // Spread the rest of the product properties
  }))

  if (status === 'loading' || status === 'idle') {
    return (
      <section className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto text-center">
          <p>Loading products...</p>
        </div>
      </section>
    )
  }

  if (status === 'failed') {
    return (
      <section className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto text-center text-red-500">
          Error loading products: {error}
        </div>
      </section>
    )
  }

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">NEW ARRIVAL</h2>
          <p className="text-gray-600">New Arrival Products</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {mappedProducts.map((product) => (
            <div
              key={product.id}
              className="block relative hover:shadow-lg transition-shadow duration-300 rounded-lg"
            >
              <ProductCard
                id={product.id}
                image={product.image}
                brand={product.brand}
                name={product.name}
                price={product.price}
                isNew={product.isNew}
                isVideo={product.isVideo}
                flashSale={product.flashSale}
                special={product.special}
                discount={product.discount}
                status={product.status}
                minOrderLimit={product.minOrderLimit}
                sideImages={product.sideImages}
                {...product} // Pass all remaining product props
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default NewArrivalSection
