'use client'

import { FiGrid, FiList } from 'react-icons/fi'

export const ProductsToolbar = ({
  viewMode,
  setViewMode,
  products,
  sortBy,
  setSortBy,
  itemsPerPage,
  setItemsPerPage,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-col sm:flex-row justify-between items-center">
      <div className="flex items-center space-x-4 mb-4 sm:mb-0">
        <button
          className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          onClick={() => setViewMode('grid')}
          title="Grid view"
        >
          <FiGrid />
        </button>
        <button
          className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          onClick={() => setViewMode('list')}
          title="List view"
        >
          <FiList />
        </button>
        <span className="text-sm text-gray-500">
          Showing {products.length} products
        </span>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <label className="text-sm text-gray-600 mr-2">Sort by:</label>
          <select
            className="border rounded p-1 text-sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="price_low">Low to High</option>
            <option value="price_high">High to Low</option>
            <option value="az">A to Z</option>
            <option value="za">Z to A</option>
          </select>
        </div>

        <div className="flex items-center">
          <label className="text-sm text-gray-600 mr-2">Show:</label>
          <select
            className="border rounded p-1 text-sm"
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
          >
            <option value="15">15</option>
            <option value="30">30</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>
    </div>
  )
}

export default ProductsToolbar
