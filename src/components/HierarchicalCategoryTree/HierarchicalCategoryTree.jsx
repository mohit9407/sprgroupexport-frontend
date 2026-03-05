'use client'

import { useState } from 'react'
import { ChevronDownCircleIcon, ChevronRightCircleIcon } from 'lucide-react'

export const HierarchicalCategoryTree = ({
  categories,
  selectedCategory,
  onCategorySelect,
  showAllExpanded = false,
  className = '',
}) => {
  const [expandedNodes, setExpandedNodes] = useState(
    showAllExpanded ? categories.map((cat) => cat._id) : [],
  )

  const toggleNode = (categoryId) => {
    setExpandedNodes((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    )
  }

  const handleCategoryClick = (category) => {
    onCategorySelect?.(category)

    if (category.children && category.children.length > 0) {
      if (!expandedNodes.includes(category._id)) {
        setExpandedNodes((prev) => [...prev, category._id])
      }
    }
  }

  const renderCategory = (category, level = 0) => {
    const isExpanded = expandedNodes.includes(category._id)
    const hasChildren = category.children && category.children.length > 0
    const isSelected = selectedCategory === category._id

    return (
      <div key={category._id} className="select-none">
        <div
          className={`
            flex items-center py-2 px-3 rounded-lg cursor-pointer transition-all duration-200
            hover:bg-gray-100
            ${isSelected ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'}
            ${level > 0 ? 'ml-6' : ''}
          `}
          style={{ marginLeft: `${level * 24}px` }}
          onClick={() => handleCategoryClick(category)}
        >
          {/* Expand/Collapse Icon */}
          {hasChildren && (
            <button
              type="button"
              className="mr-2 p-1 hover:bg-gray-200 rounded transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                toggleNode(category._id)
              }}
            >
              {isExpanded ? (
                <ChevronDownCircleIcon className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRightCircleIcon className="w-4 h-4 text-gray-500" />
              )}
            </button>
          )}

          {!hasChildren && <div className="w-6 mr-2"></div>}

          {/* Category Name */}
          <span className="flex-1 text-sm">{category.name}</span>

          {/* Badge for child count */}
          {hasChildren && (
            <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
              {category.children.length}
            </span>
          )}
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="mt-1">
            {category.children.map((child) => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  if (!categories || categories.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <p className="text-sm">No categories available</p>
      </div>
    )
  }

  return (
    <div className={`border border-gray-200 rounded-lg bg-white ${className}`}>
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Select Category
        </h3>
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {categories.map((category) => renderCategory(category))}
        </div>
      </div>
    </div>
  )
}

export const HierarchicalCategorySelect = ({
  categories,
  value,
  onChange,
  placeholder = 'Select a category',
  required = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleCategorySelect = (category) => {
    onChange?.(category._id)
    setIsOpen(false)
  }

  const getSelectedCategoryName = () => {
    if (!value) return placeholder

    // Search recursively in the hierarchical tree
    const findCategoryInTree = (categories, categoryId) => {
      for (const category of categories) {
        if (category._id === categoryId) {
          return category
        }
        if (category.children && category.children.length > 0) {
          const found = findCategoryInTree(category.children, categoryId)
          if (found) return found
        }
      }
      return null
    }

    const selected = findCategoryInTree(categories, value)
    return selected ? selected.name : placeholder
  }

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        className={`
          w-full px-3 py-2 text-left border border-gray-300 rounded-md shadow-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          bg-white text-sm
          ${required && !value}
        `}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={value ? 'text-gray-900' : 'text-gray-500'}>
          {getSelectedCategoryName()}
        </span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <HierarchicalCategoryTree
            categories={categories}
            selectedCategory={value}
            onCategorySelect={handleCategorySelect}
            className="border-0 rounded-t-none"
          />
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div className="fixed inset-0 z-0" onClick={() => setIsOpen(false)} />
      )}
    </div>
  )
}

export default HierarchicalCategoryTree
