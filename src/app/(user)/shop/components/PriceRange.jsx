'use client'

export const PriceRange = ({
  priceRange,
  setPriceRange,
  handleResetFilters,
  applyFilters,
}) => {
  return (
    <div className="border-t border-gray-200 pt-4">
      <h4 className="text-sm font-medium text-gray-700 mb-4">PRICE RANGE</h4>
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label
              htmlFor="minPrice"
              className="block text-xs text-gray-500 mb-1"
            >
              Min
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">₹</span>
              </div>
              <input
                type="number"
                id="minPrice"
                value={priceRange[0]}
                onChange={(e) =>
                  setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])
                }
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-3 py-2 sm:text-sm border border-gray-300 rounded-md"
                placeholder="0"
              />
            </div>
          </div>
          <div className="flex-1">
            <label
              htmlFor="maxPrice"
              className="block text-xs text-gray-500 mb-1"
            >
              Max
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">₹</span>
              </div>
              <input
                type="number"
                id="maxPrice"
                value={priceRange[1]}
                onChange={(e) =>
                  setPriceRange([priceRange[0], parseInt(e.target.value) || 0])
                }
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-3 py-2 sm:text-sm border border-gray-300 rounded-md"
                placeholder="100000"
              />
            </div>
          </div>
        </div>
        <div className="px-1">
          <input
            type="range"
            min="0"
            max="1000000"
            step="1000"
            value={priceRange[1]}
            onChange={(e) =>
              setPriceRange([priceRange[0], parseInt(e.target.value)])
            }
            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        <div className="flex space-x-3 pt-2">
          <button
            className="flex-1 bg-gray-200 text-gray-800 text-sm font-medium py-2 px-4 rounded hover:bg-gray-300 transition-colors"
            onClick={handleResetFilters}
          >
            RESET
          </button>
          <button
            className="flex-1 bg-[#ba8b4e] text-white text-sm font-medium py-2 px-4 rounded hover:bg-[#a87d45] transition-colors"
            onClick={applyFilters}
          >
            APPLY
          </button>
        </div>
      </div>
    </div>
  )
}

export default PriceRange
