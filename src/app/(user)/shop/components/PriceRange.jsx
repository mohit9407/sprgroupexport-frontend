'use client'
import { useState, useRef, useEffect } from 'react'

export const PriceRange = ({
  priceRange: [minPrice, maxPrice],
  setPriceRange,
  handleResetFilters,
  applyFilters,
}) => {
  const [localPriceRange, setLocalPriceRange] = useState([minPrice, maxPrice])
  const minValRef = useRef(minPrice)
  const maxValRef = useRef(maxPrice)
  const range = useRef(null)
  const min = 0
  const max = 1000000
  const step = 1000

  // Update local state when props change
  useEffect(() => {
    setLocalPriceRange([minPrice, maxPrice])
  }, [minPrice, maxPrice])

  // Convert to percentage
  const getPercent = (value) => Math.round(((value - min) / (max - min)) * 100)

  // Set width of the range to decrease from the left side
  const minPercent = getPercent(localPriceRange[0])
  const maxPercent = getPercent(localPriceRange[1])

  // Handle min price change
  const handleMinChange = (e) => {
    const value = parseInt(e.target.value)
    const newMin = Math.min(value, localPriceRange[1] - step)
    setLocalPriceRange([newMin, localPriceRange[1]])
  }

  // Handle max price change
  const handleMaxChange = (e) => {
    const value = parseInt(e.target.value)
    const newMax = Math.max(value, localPriceRange[0] + step)
    setLocalPriceRange([localPriceRange[0], newMax])
  }

  // Update parent state and trigger API call when user finishes interacting
  const handleBlur = () => {
    if (localPriceRange[0] !== minPrice || localPriceRange[1] !== maxPrice) {
      setPriceRange(localPriceRange)
      applyFilters()
    }
  }

  // Handle reset
  const handleReset = () => {
    const resetRange = [0, 150000]
    setLocalPriceRange(resetRange)
    handleResetFilters()
  }

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
                value={localPriceRange[0]}
                onChange={handleMinChange}
                onBlur={handleBlur}
                min={min}
                max={max - step}
                step={step}
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
                value={localPriceRange[1]}
                onChange={handleMaxChange}
                onBlur={handleBlur}
                min={min + step}
                max={max}
                step={step}
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-3 py-2 sm:text-sm border border-gray-300 rounded-md"
                placeholder="100000"
              />
            </div>
          </div>
        </div>

        {/* Custom range slider */}
        <div className="relative pt-6 px-2">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={localPriceRange[0]}
            onChange={handleMinChange}
            onMouseUp={handleBlur}
            onTouchEnd={handleBlur}
            className={`absolute w-full h-1 z-10 bg-transparent pointer-events-none appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#ba8b4e] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-20`}
          />
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={localPriceRange[1]}
            onChange={handleMaxChange}
            onMouseUp={handleBlur}
            onTouchEnd={handleBlur}
            className={`absolute w-full h-1 z-10 bg-transparent pointer-events-none appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#ba8b4e] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-20`}
          />
          <div className="relative h-1">
            <div className="absolute h-1 w-full bg-gray-200 rounded-full"></div>
            <div
              className="absolute h-1 bg-[#ba8b4e] rounded-full"
              style={{
                left: `${minPercent}%`,
                width: `${maxPercent - minPercent}%`,
              }}
            ></div>
          </div>
        </div>

        <div className="flex space-x-3 pt-2">
          <button
            className="flex-1 bg-gray-200 text-gray-800 text-sm font-medium py-2 px-4 rounded hover:bg-gray-300 transition-colors"
            onClick={handleReset}
          >
            RESET
          </button>
          <button
            className="flex-1 bg-[#ba8b4e] text-white text-sm font-medium py-2 px-4 rounded hover:bg-[#a87d45] transition-colors"
            onClick={handleBlur}
          >
            APPLY
          </button>
        </div>
      </div>
    </div>
  )
}

export default PriceRange
