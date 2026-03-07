'use client'

import { useEffect, useState } from 'react'
import { FaChevronRight } from 'react-icons/fa'

export const CategoryFilter = ({
  categories,
  selectedCategories,
  toggleSubcategory,
}) => {
  const [expandedParent, setExpandedParent] = useState(null)
  const [expandedChild, setExpandedChild] = useState(null)

  const handleParentClick = (category) => {
    if (category.children?.length > 0) {
      setExpandedParent(expandedParent === category._id ? null : category._id)
      setExpandedChild(null)
    }
  }

  const handleChildClick = (child, e) => {
    e.stopPropagation()
    if (child.children?.length > 0) {
      setExpandedChild(expandedChild === child._id ? null : child._id)
    } else {
      toggleSubcategory(child._id)
    }
  }

  const handleGrandchildClick = (grandchildId, e) => {
    e.stopPropagation()
    toggleSubcategory(grandchildId)
  }

  useEffect(() => {
    categories.forEach((parent) => {
      parent.children?.forEach((child) => {
        child.children?.forEach((grandchild) => {
          if (selectedCategories.includes(grandchild._id)) {
            setExpandedParent(parent._id)
            setExpandedChild(child._id)
          }
        })

        if (selectedCategories.includes(child._id)) {
          setExpandedParent(parent._id)
        }
      })

      if (selectedCategories.includes(parent._id)) {
        setExpandedParent(parent._id)
      }
    })
  }, [selectedCategories, categories])

  return (
    <div className="mb-6">
      {categories.map((category) => (
        <div key={category._id} className="mb-1">
          {/* Parent Level - Gold, Silver, Others */}
          <button
            className="w-full flex justify-between items-center py-2 px-1 text-left text-sm font-medium hover:bg-gray-50 rounded"
            onClick={() => handleParentClick(category)}
          >
            <div className="flex items-center">
              <input
                type="checkbox"
                id={category._id}
                className="h-4 w-4 text-[#BA8B4E] rounded border-gray-300 focus:ring-[#BA8B4E]"
                checked={selectedCategories.includes(category._id)}
                onChange={() => {}}
                onClick={(e) => {
                  e.stopPropagation()
                  toggleSubcategory(category._id)
                }}
              />
              <label
                htmlFor={category._id}
                className="ml-2 text-sm font-semibold capitalize cursor-pointer"
              >
                {category.name}
              </label>
            </div>
            {category.children?.length > 0 && (
              <FaChevronRight
                className={`text-xs text-gray-400 transition-transform ${
                  expandedParent === category._id ? 'rotate-90' : ''
                }`}
              />
            )}
          </button>

          {/* Children Level - Women, Man */}
          {expandedParent === category._id && category.children?.length > 0 && (
            <div className="pl-4 mt-1">
              {category.children.map((child) => (
                <div key={child._id}>
                  <button
                    className="w-full flex justify-between items-center py-1.5 px-1 text-left text-sm hover:bg-gray-50 rounded"
                    onClick={(e) => handleChildClick(child, e)}
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={child._id}
                        className="h-4 w-4 text-[#BA8B4E] rounded border-gray-300 focus:ring-[#BA8B4E]"
                        checked={selectedCategories.includes(child._id)}
                        onChange={() => {}}
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleSubcategory(child._id)
                        }}
                      />
                      <label
                        htmlFor={child._id}
                        className="ml-2 text-sm text-gray-700 capitalize cursor-pointer"
                      >
                        {child.name}
                      </label>
                    </div>
                    {child.children?.length > 0 && (
                      <FaChevronRight
                        className={`text-xs text-gray-400 transition-transform ${
                          expandedChild === child._id ? 'rotate-90' : ''
                        }`}
                      />
                    )}
                  </button>

                  {/* Grandchildren Level - ring, earring */}
                  {expandedChild === child._id &&
                    child.children?.length > 0 && (
                      <div className="pl-8 py-1">
                        {child.children.map((grandchild) => (
                          <div
                            key={grandchild._id}
                            className="flex items-center py-1"
                          >
                            <input
                              type="checkbox"
                              id={grandchild._id}
                              className="h-4 w-4 text-[#BA8B4E] rounded border-gray-300 focus:ring-[#BA8B4E]"
                              checked={selectedCategories.includes(
                                grandchild._id,
                              )}
                              onChange={() => {}}
                              onClick={(e) =>
                                handleGrandchildClick(grandchild._id, e)
                              }
                            />
                            <label
                              htmlFor={grandchild._id}
                              className="ml-2 text-sm text-gray-600 capitalize cursor-pointer hover:text-[#BA8B4E]"
                            >
                              {grandchild.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default CategoryFilter
