'use client'

import { useState } from 'react'
import { FaChevronRight } from 'react-icons/fa'

export const CategoryFilter = ({
  categories,
  selectedCategories,
  toggleSubcategory,
}) => {
  const [expandedCategories, setExpandedCategories] = useState([])

  const toggleExpanded = (categoryId) => {
    setExpandedCategories((previous) =>
      previous.includes(categoryId)
        ? previous.filter((id) => id !== categoryId)
        : [...previous, categoryId],
    )
  }

  const getCategoryIds = (category) => {
    const ids = [category._id]
    category.children?.forEach((child) => ids.push(...getCategoryIds(child)))
    return ids
  }

  const findCategoryPath = (tree, categoryId, path = []) => {
    for (const category of tree) {
      const nextPath = [...path, category._id]
      if (category._id === categoryId) return nextPath

      if (category.children?.length > 0) {
        const foundPath = findCategoryPath(
          category.children,
          categoryId,
          nextPath,
        )
        if (foundPath) return foundPath
      }
    }
    return null
  }

  const handleCategoryToggle = (category) => {
    const path = findCategoryPath(categories, category._id) || [category._id]
    const isSelected = selectedCategories.includes(category._id)

    if (isSelected) {
      toggleSubcategory(category._id)
      return
    }

    const descendantIds = getCategoryIds(category)
    const ancestorIds = path.slice(0, -1)
    const conflictingIds = new Set([...descendantIds, ...ancestorIds])
    const nextSelection = selectedCategories.filter(
      (id) => !conflictingIds.has(id),
    )

    toggleSubcategory(category._id, nextSelection)
  }

  const renderCategory = (category, level = 0) => {
    const hasChildren = category.children?.length > 0
    const isExpanded = expandedCategories.includes(category._id)

    return (
      <div key={category._id} className="mb-1">
        <div
          className="w-full flex justify-between items-center py-1.5 px-1 text-left text-sm hover:bg-gray-50 rounded"
          style={{ paddingLeft: `${level * 16 + 4}px` }}
        >
          <div className="flex items-center min-w-0">
            <input
              type="checkbox"
              id={category._id}
              className="h-4 w-4 shrink-0 text-[#BA8B4E] rounded border-gray-300 focus:ring-[#BA8B4E]"
              checked={selectedCategories.includes(category._id)}
              onChange={() => handleCategoryToggle(category)}
            />
            <label
              htmlFor={category._id}
              className={`ml-2 text-sm capitalize cursor-pointer ${level === 0 ? 'font-semibold' : 'text-gray-700'}`}
            >
              {category.name}
            </label>
          </div>
          {hasChildren && (
            <button
              type="button"
              aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${category.name}`}
              className="p-1"
              onClick={() => toggleExpanded(category._id)}
            >
              <FaChevronRight
                className={`text-xs text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              />
            </button>
          )}
        </div>
        {hasChildren && isExpanded && (
          <div>
            {category.children.map((child) => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="mb-6">
      {categories.map((category) => renderCategory(category))}
    </div>
  )
}

export default CategoryFilter
