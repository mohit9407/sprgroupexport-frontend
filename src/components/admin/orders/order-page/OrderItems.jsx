import React from 'react'
import Image from 'next/image'

const OrderItems = ({ loadingDetails, products, order }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b">
        <h2 className="text-lg font-semibold">Order Items</h2>
      </div>
      <div className="divide-y">
        {loadingDetails.products ? (
          <div className="p-4">
            <div className="animate-pulse flex space-x-4">
              <div className="h-20 w-20 bg-gray-200 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ) : products.length > 0 ? (
          products.map((product) => (
            <div key={product._id || product.orderItemId} className="p-4 flex">
              <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 relative">
                <Image
                  src={
                    product.images?.[0]?.thumbnailUrl ||
                    '/images/placeholder-product.png'
                  }
                  alt={product.name}
                  width={80}
                  height={80}
                  className="h-full w-full object-cover object-center"
                />
              </div>
              <div className="ml-4 flex-1">
                <div>
                  <div className="flex justify-between text-base font-medium text-gray-900">
                    <h3>{product.name}</h3>
                    <p className="ml-4">
                      ₹
                      {product.salePrice
                        ? product.salePrice.toFixed(2)
                        : '0.00'}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Qty: {product.quantity}
                    {product.sku && (
                      <span className="ml-2 text-gray-400">
                        SKU: {product.sku}
                      </span>
                    )}
                  </p>
                  {product.variants &&
                    Object.keys(product.variants).length > 0 && (
                      <div className="mt-1 text-sm text-gray-500">
                        {Object.entries(product.variants).map(
                          ([key, value]) => (
                            <span key={key} className="mr-2">
                              {key}: {value}
                            </span>
                          ),
                        )}
                      </div>
                    )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="p-4 text-gray-500">No items found in this order.</p>
        )}
      </div>
      <div className="border-t border-gray-200 px-6 py-4">
        <div className="flex justify-between text-base font-medium text-gray-900">
          <p>Subtotal</p>
          <p>
            ₹
            {products
              .reduce(
                (acc, product) =>
                  acc + (product.salePrice || product.price) * product.quantity,
                0,
              )
              .toFixed(2) || '0.00'}
          </p>
        </div>
        <div className="flex justify-between text-sm text-gray-600 mt-1">
          <p>Shipping</p>
          <p>₹{order.shipping?.toFixed(2) || '0.00'}</p>
        </div>
        <div className="flex justify-between text-sm text-gray-600 mt-1">
          <p>Tax</p>
          <p>₹{order.tax?.toFixed(2) || '0.00'}</p>
        </div>
        <div className="flex justify-between text-lg font-bold mt-3 pt-3 border-t border-gray-200">
          <p>Total</p>
          <p>₹{order.total?.toFixed(2) || '0.00'}</p>
        </div>
      </div>
    </div>
  )
}

export default OrderItems
