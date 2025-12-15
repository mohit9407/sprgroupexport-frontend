import React from 'react'
import ProductCard from '../ProductCard'
import Link from 'next/link'
import { products } from '../../data/products'

const NewArrivalSection = () => {
  return (
    <section className="px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">NEW ARRIVAL</h2>
          <p className="text-gray-600">New Arrival Products</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
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
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default NewArrivalSection
