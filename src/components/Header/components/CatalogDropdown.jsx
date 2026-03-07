'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
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
            // This category has a valid parent, add it to parent's children
            categoryMap[category.parent].children.push(categoryNode)
          } else {
            // This is a root category (no parent or parent doesn't exist)
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
    console.log(`Setting activeSubmenus to include: ${categoryId}`)

    if (categoryId === null) {
      setActiveSubmenus([])
    } else {
      // Add this category to active submenus if not already present
      setActiveSubmenus((prev) =>
        prev.includes(categoryId) ? prev : [...prev, categoryId],
      )
    }
  }

  const handleCategoryClick = (category, e) => {
    // Prevent default link behavior for categories with children
    if (category.children && category.children.length > 0) {
      e.preventDefault()
      return
    }

    // For leaf categories (no children), redirect to shop page with category filter
    e.preventDefault()
    window.location.href = `/shop?category=${category._id}`
  }

  const renderCategory = (category, level = 0) => {
    if (!category?._id) return null

    const hasChildren = category.children && category.children.length > 0
    const categoryId = `category-${category._id}`

    // Get parent name for better distinction
    const getParentName = (cat, allCats) => {
      if (!cat?.parent) return ''
      const parent = allCats?.find((c) => c._id === cat.parent)
      return parent ? parent.name : ''
    }

    const parentName = getParentName(category, allCategories?.data || [])
    const displayName =
      level > 0 && parentName ? `${category.name}` : category.name

    if (hasChildren) {
      console.log(
        `  Children: ${category.children.map((c) => c.name).join(', ')}`,
      )
    }

    return (
      <div
        key={category._id}
        className="relative group"
        onMouseEnter={() => {
          // Clear any existing timeout
          if (timeoutId) {
            clearTimeout(timeoutId)
            setTimeoutId(null)
          }

          // Set this category as active if it has children
          if (hasChildren) {
            // Build the complete path from root to this category
            const pathToCategory = []
            let currentCategory = category

            // Find all parents up to root
            while (
              currentCategory?.parent &&
              allCategories?.data?.find((c) => c._id === currentCategory.parent)
            ) {
              const parent = allCategories.data.find(
                (c) => c._id === currentCategory.parent,
              )
              if (parent) {
                pathToCategory.unshift(parent._id)
                currentCategory = parent
              } else {
                break
              }
            }

            // Add this category to the path
            pathToCategory.push(category._id)

            // Set all categories in the path as active
            setActiveSubmenus(pathToCategory)
          } else if (level > 0) {
            // For leaf categories, keep the parent hierarchy active
            let rootParent = category
            const pathToParent = []

            while (
              rootParent?.parent &&
              allCategories?.data?.find((c) => c._id === rootParent.parent)
            ) {
              const foundParent = allCategories.data.find(
                (c) => c._id === rootParent.parent,
              )
              if (foundParent) {
                pathToParent.unshift(foundParent._id)
                rootParent = foundParent
              } else {
                break
              }
            }

            // Add the immediate parent
            if (category.parent) {
              pathToParent.push(category.parent)
            }

            setActiveSubmenus(pathToParent)
          } else if (level === 0 && !hasChildren) {
            // For root categories without children, clear any active submenu
            setActiveSubmenus([])
          }
        }}
        onMouseLeave={() => {
          console.log(
            `Mouse leave: ${category.name} (ID: ${category._id}, level: ${level})`,
          )
          // Don't immediately clear, let the main handler manage timing with delay
        }}
      >
        <Link
          href={`/catalog/${category.name.toLowerCase()}`}
          className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          onClick={(e) => handleCategoryClick(category, e)}
        >
          <span className="capitalize">{displayName}</span>
          {hasChildren && <FaChevronDown className="text-xs text-gray-400" />}
        </Link>

        {hasChildren && activeSubmenus.includes(category._id) && (
          <div
            className="absolute top-0 bg-white border border-gray-200 shadow-lg z-50"
            style={{
              left: level === 0 ? '100%' : '100%',
              top: level === 0 ? '0' : '-8px',
              minWidth: '200px',
              padding: '8px 0',
              marginLeft: '0px',
              marginTop: '0px',
              zIndex: 50 + level, // Ensure deeper levels appear on top
            }}
            onMouseEnter={() => {
              // Build the complete path for this submenu
              const pathToCategory = []
              let currentCategory = category

              // Find all parents up to root
              while (
                currentCategory?.parent &&
                allCategories?.data?.find(
                  (c) => c._id === currentCategory.parent,
                )
              ) {
                const parent = allCategories.data.find(
                  (c) => c._id === currentCategory.parent,
                )
                if (parent) {
                  pathToCategory.unshift(parent._id)
                  currentCategory = parent
                } else {
                  break
                }
              }

              // Add this category to the path
              pathToCategory.push(category._id)

              setActiveSubmenus(pathToCategory)
            }}
            onMouseLeave={() => {
              console.log(`Submenu mouse leave: ${category.name}`)
              // Don't immediately clear, let the main handler manage timing
            }}
          >
            {category.children.map((child) => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <div
      className="absolute left-0 mt-0"
      style={{ minWidth: '1400px' }} // Even larger for more levels
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={`w-48 bg-white shadow-lg z-50 border border-gray-200 ${className}`}
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
