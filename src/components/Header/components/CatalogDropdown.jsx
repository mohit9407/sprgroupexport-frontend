'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FaChevronDown } from 'react-icons/fa'
import { useSelector, useDispatch } from 'react-redux'
import {
  fetchAllCategories,
  selectAllCategories,
} from '@/features/categories/categoriesSlice'

const CatalogDropdown = ({
  isOpen,
  onMouseEnter,
  onMouseLeave,
  className = '',
}) => {
  const [activeSubmenus, setActiveSubmenus] = useState([])
  const [hierarchicalCategories, setHierarchicalCategories] = useState([])
  const [timeoutId, setTimeoutId] = useState(null)
  const dispatch = useDispatch()
  const router = useRouter()

  const allCategories = useSelector(selectAllCategories)

  // Fetch categories only once when component mounts
  useEffect(() => {
    dispatch(fetchAllCategories())
  }, [dispatch]) // Only run once when dispatch is available

  // Build hierarchical structure when categories change
  useEffect(() => {
    if (allCategories?.data && allCategories.data.length > 0) {
      const buildCategoryTree = (categories = []) => {
        const categoryMap = {}
        const rootCategories = []

        // Create a map of all categories
        categories.forEach((category) => {
          if (category?._id) {
            categoryMap[category._id] = {
              ...category,
              children: [],
            }
          }
        })

        // Build the tree structure
        categories.forEach((category) => {
          if (!category?._id) return
          const categoryNode = categoryMap[category._id]

          if (category.parent && categoryMap[category.parent]) {
            categoryMap[category.parent].children.push(categoryNode)
          } else if (!category.parent) {
            rootCategories.push(categoryNode)
          }
        })

        return rootCategories
      }

      const treeData = buildCategoryTree(allCategories.data)
      setHierarchicalCategories(treeData)
    }
  }, [allCategories?.data])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [timeoutId])

  const handleMouseEnter = () => {
    // Clear any existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId)
      setTimeoutId(null)
    }
    onMouseEnter()
  }

  const handleMouseLeave = () => {
    // Add a longer delay for deeper navigation paths
    const id = setTimeout(() => {
      setActiveSubmenus([])
      onMouseLeave()
      setTimeoutId(null)
    }, 600) // Increased from 400ms to 600ms for deeper levels
    setTimeoutId(id)
  }

  const handleSubmenuMouseEnter = (categoryId) => {
    // Clear any existing timeout when entering submenu
    if (timeoutId) {
      clearTimeout(timeoutId)
      setTimeoutId(null)
    }
    if (categoryId === null) {
      setActiveSubmenus([])
    } else {
      setActiveSubmenus((prev) =>
        prev.includes(categoryId)
          ? prev.filter((id) => id !== categoryId)
          : [...prev, categoryId],
      )
    }
  }

  const handleCategoryClick = (category, e) => {
    // For categories with children, navigate to the main category page
    if (category.children && category.children.length > 0) {
      e.preventDefault()
      router.push(`/shop?category=${category._id}`)
      return
    }

    // For leaf categories (no children), redirect to shop page with category filter
    e.preventDefault()
    router.push(`/shop?category=${category._id}`)
  }

  const renderCategory = (category, level = 0) => {
    if (!category?._id) return null

    const hasChildren = category.children && category.children.length > 0
    const isExpanded = activeSubmenus.includes(category._id)

    return (
      <div key={category._id}>
        <div
          className="flex items-center justify-between py-2 pr-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          style={{ paddingLeft: `${level * 16 + 12}px` }}
        >
          <Link
            href={`/catalog/${category.name.toLowerCase()}`}
            className={`flex-1 ${level === 0 ? 'font-medium capitalize' : 'capitalize'}`}
            onClick={(e) => handleCategoryClick(category, e)}
          >
            {category.name}
          </Link>
          {hasChildren && (
            <button
              type="button"
              aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${category.name}`}
              className="p-1"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleSubmenuMouseEnter(category._id)
              }}
            >
              <FaChevronDown
                className={`text-xs text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              />
            </button>
          )}
        </div>

        {hasChildren &&
          isExpanded &&
          category.children.map((child) => renderCategory(child, level + 1))}
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <div
      className="absolute left-0 mt-0"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={`w-64 max-h-[70vh] overflow-y-auto bg-white shadow-lg z-50 border border-gray-200 ${className}`}
      >
        {hierarchicalCategories.length > 0 ? (
          hierarchicalCategories.map((category) => renderCategory(category))
        ) : (
          <div className="px-4 py-2 text-sm text-gray-500">
            Loading categories...
          </div>
        )}
      </div>
    </div>
  )
}

export default CatalogDropdown
