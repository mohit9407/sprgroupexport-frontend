'use client'

import dynamic from 'next/dynamic'
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectAllProducts } from '@/features/products/productsSlice'
import { useWishlist } from '@/context/WishlistContext'
import ProductCard from '@/components/ProductCard'
import { fetchProducts } from '@/features/products/productsSlice'
import { fetchAllCategories } from '@/features/categories/categoriesSlice'
import AuthModal from '@/components/Auth/AuthModal'

// Import components with dynamic imports to avoid SSR issues
const CategoryFilter = dynamic(() => import('./components/CategoryFilter'), {
  ssr: false,
})
const PriceRange = dynamic(() => import('./components/PriceRange'), {
  ssr: false,
})
const ProductsToolbar = dynamic(() => import('./components/ProductsToolbar'), {
  ssr: false,
})

// Disable SSR for the main content to avoid hydration issues
const ShopContent = dynamic(() => Promise.resolve(ShopPageContent), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  ),
})

// Transform flat categories array into a nested structure
// Transform flat categories array into a nested structure
const mapCategories = (categories = []) => {
  // Ensure categories is an array
  const categoriesArray = Array.isArray(categories)
    ? categories
    : Array.isArray(categories?.data)
      ? categories.data
      : []

  // Create a map of all categories by their _id for quick lookup
  const categoryMap = {}
  categoriesArray.forEach((category) => {
    if (category?._id) {
      categoryMap[category._id] = { ...category, children: [] }
    }
  })

  // Build the category tree
  const categoryTree = []

  categoriesArray.forEach((category) => {
    if (!category?._id) return // Skip if no _id

    const node = categoryMap[category._id]
    if (!node) return // Skip if node not found in map

    if (category.parent) {
      // If it has a parent, add it to the parent's children array
      if (categoryMap[category.parent]) {
        if (!categoryMap[category.parent].children) {
          categoryMap[category.parent].children = []
        }
        categoryMap[category.parent].children.push(node)
      }
    } else {
      // If no parent, it's a root category
      categoryTree.push(node)
    }
  })

  return categoryTree
}

// Helper function to get category name by ID
const getCategoryNameById = (categoryId, categories) => {
  if (!categoryId || !categories) return 'Uncategorized'

  // Ensure categories is an array
  const categoriesArray = Array.isArray(categories)
    ? categories
    : Array.isArray(categories?.data)
      ? categories.data
      : []

  // Try to find the category
  const category = categoriesArray.find((cat) => cat?._id === categoryId)
  return category?.name || 'Uncategorized'
}

// Map products to match ProductCard props
const mapProducts = (products = [], allCategories = []) => {
  return products.map((product) => ({
    id: product._id || product.id,
    image: product.image || product.images?.[0]?.url || '/images/ring-bg.jpg',
    brand:
      product.brand ||
      getCategoryNameById(product.category, allCategories) ||
      'N/A',
    name: product.productModel || product.name || 'Product Name',
    price: product.price ? product.price.toFixed(2) : '0.00',
    isNew: product.isNew || false,
    discount: product.discount ? `${product.discount}% OFF` : null,
    status: product.status || 'in-stock',
    minOrderLimit: product.minOrderLimit || 1,
    sideImages: product.sideImages || product.images?.slice(1) || [],
    categoryId: product.category,
    ...product,
  }))
}

function ShopPageContent() {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [switchToEmail, setSwitchToEmail] = useState(false)
  const dispatch = useDispatch()
  // Get products data using the selector
  const {
    items: products = [],
    status,
    error,
    filters: currentFilters = {},
    pagination = {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 15,
    },
  } = useSelector((state) => selectAllProducts(state) || {})

  const { allCategories = { data: [] }, status: categoriesStatus } =
    useSelector((state) => state.categories || {})

  const [priceRange, setPriceRange] = useState([0, 150000])
  const [selectedCategories, setSelectedCategories] = useState([])
  const [viewMode, setViewMode] = useState('grid')
  const [sortBy, setSortBy] = useState('newest')
  const [itemsPerPage, setItemsPerPage] = useState(15)
  const [expandedCategories, setExpandedCategories] = useState({})
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const { isInWishlist } = useWishlist()

  // Map categories for display
  const categories = useMemo(
    () => mapCategories(allCategories.data || []),
    [allCategories.data],
  )

  // Handle filter changes
  const applyFilters = useCallback(
    (filters = {}) => {
      const newFilters = {
        minPrice:
          filters.minPrice !== undefined ? filters.minPrice : priceRange[0],
        maxPrice:
          filters.maxPrice !== undefined ? filters.maxPrice : priceRange[1],
        categories:
          filters.categories !== undefined
            ? filters.categories
            : selectedCategories,
        sortBy: filters.sortBy !== undefined ? filters.sortBy : sortBy,
        page: filters.page !== undefined ? filters.page : 1,
        limit: filters.limit !== undefined ? filters.limit : itemsPerPage,
      }

      dispatch(fetchProducts(newFilters))
    },
    [priceRange, selectedCategories, sortBy, itemsPerPage, dispatch],
  )

  // Apply filters when they change
  useEffect(() => {
    if (!isInitialLoad) {
      const timer = setTimeout(() => {
        applyFilters()
      }, 300) // Small debounce to avoid too many requests

      return () => clearTimeout(timer)
    } else {
      setIsInitialLoad(false)
    }
  }, [
    priceRange,
    selectedCategories,
    sortBy,
    itemsPerPage,
    applyFilters,
    isInitialLoad,
  ])

  // Initial data fetch
  useEffect(() => {
    if (status === 'idle') {
      applyFilters()
    }
    if (categoriesStatus === 'idle') {
      dispatch(fetchAllCategories())
    }
  }, [status, categoriesStatus, dispatch, applyFilters])

  // Memoize the categories data to prevent unnecessary re-renders
  const categoriesData = useMemo(
    () => allCategories?.data || [],
    [allCategories?.data],
  )

  // Memoize mapped products to prevent unnecessary recalculations
  const mappedProducts = useMemo(() => {
    return mapProducts(products, categoriesData)
  }, [products, categoriesData])

  const toggleCategory = (categoryId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }))
  }

  const toggleSubcategory = (subcategoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(subcategoryId)
        ? prev.filter((id) => id !== subcategoryId)
        : [...prev, subcategoryId],
    )
  }

  const handleResetFilters = () => {
    setPriceRange([0, 150000])
    setSelectedCategories([])
    setSortBy('newest')
    setItemsPerPage(15)
    applyFilters({
      minPrice: 0,
      maxPrice: 150000,
      categories: [],
      sortBy: 'newest',
      limit: 15,
      page: 1,
    })
  }

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      applyFilters({ page: newPage })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        switchToEmail={switchToEmail}
      />
      <h1 className="text-2xl font-bold mb-6">Shop</h1>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-1/4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            {categoriesStatus === 'loading' ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              </div>
            ) : categoriesStatus === 'failed' ? (
              <div className="text-red-500 text-sm p-2">
                Failed to load categories
              </div>
            ) : (
              <>
                <CategoryFilter
                  categories={categories}
                  expandedCategories={expandedCategories}
                  selectedCategories={selectedCategories}
                  toggleCategory={toggleCategory}
                  toggleSubcategory={toggleSubcategory}
                />
                <PriceRange
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                  handleResetFilters={handleResetFilters}
                  applyFilters={() => applyFilters()}
                />
              </>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full md:w-3/4">
          <ProductsToolbar
            viewMode={viewMode}
            setViewMode={setViewMode}
            products={products}
            sortBy={sortBy}
            setSortBy={setSortBy}
            itemsPerPage={itemsPerPage}
            setItemsPerPage={setItemsPerPage}
          />

          {/* Products Grid */}
          {(status === 'loading' || status === 'idle') &&
          !mappedProducts.length ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : status === 'failed' ? (
            <div className="text-center py-8 text-red-500">
              {error || 'Failed to load products'}
            </div>
          ) : mappedProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No products found
            </div>
          ) : (
            <div
              className={`${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}`}
            >
              {mappedProducts.map((product) => {
                const categoryName = getCategoryNameById(
                  product.categoryId,
                  allCategories,
                )
                return (
                  <div
                    key={product.id}
                    className={
                      viewMode === 'grid'
                        ? 'transition-transform hover:scale-[1.02]'
                        : ''
                    }
                  >
                    <ProductCard
                      id={product.id}
                      image={product.image}
                      brand={categoryName}
                      name={product.name}
                      price={product.price}
                      isNew={product.isNew}
                      discount={product.discount}
                      status={product.status}
                      minOrderLimit={product.minOrderLimit}
                      sideImages={product.sideImages}
                      viewMode={viewMode}
                      isLiked={isInWishlist(product.id)}
                      // Only pass necessary props to avoid hydration mismatches
                      key={`${product.id}-${viewMode}`}
                      className="h-full"
                    />
                  </div>
                )
              })}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">
                  {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}
                </span>{' '}
                to{' '}
                <span className="font-medium">
                  {Math.min(
                    pagination.currentPage * pagination.itemsPerPage,
                    pagination.totalItems,
                  )}
                </span>{' '}
                of <span className="font-medium">{pagination.totalItems}</span>{' '}
                results
              </div>
              <nav
                className="inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className={`px-3 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${pagination.currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                >
                  Previous
                </button>

                {/* First Page */}
                {pagination.currentPage > 2 && (
                  <button
                    onClick={() => handlePageChange(1)}
                    className="px-3 py-2 border-t border-b border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    1
                  </button>
                )}

                {/* Ellipsis before current page if needed */}
                {pagination.currentPage > 3 && (
                  <span className="px-3 py-2 border border-gray-300 bg-white text-sm text-gray-700">
                    ...
                  </span>
                )}

                {/* Previous page button */}
                {pagination.currentPage > 1 && (
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    className="px-3 py-2 border-t border-b border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    {pagination.currentPage - 1}
                  </button>
                )}

                {/* Current page */}
                <button
                  className="px-3 py-2 border-t border-b border-gray-300 bg-blue-50 text-sm font-medium text-blue-600"
                  aria-current="page"
                >
                  {pagination.currentPage}
                </button>

                {/* Next page button */}
                {pagination.currentPage < pagination.totalPages && (
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    className="px-3 py-2 border-t border-b border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    {pagination.currentPage + 1}
                  </button>
                )}

                {/* Ellipsis after current page if needed */}
                {pagination.currentPage < pagination.totalPages - 2 && (
                  <span className="px-3 py-2 border border-gray-300 bg-white text-sm text-gray-700">
                    ...
                  </span>
                )}

                {/* Last Page */}
                {pagination.currentPage < pagination.totalPages - 1 && (
                  <button
                    onClick={() => handlePageChange(pagination.totalPages)}
                    className="px-3 py-2 border-t border-b border-r border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    {pagination.totalPages}
                  </button>
                )}

                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className={`px-3 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${pagination.currentPage === pagination.totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ShopPage() {
  return <ShopContent />
}
