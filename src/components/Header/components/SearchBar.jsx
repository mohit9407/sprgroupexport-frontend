'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { FaChevronDown, FaChevronRight } from 'react-icons/fa'
import { useSelector } from 'react-redux'
import { selectAllCategories } from '@/features/categories/categoriesSlice'

const SearchBar = () => {
  const [showCategories, setShowCategories] = useState(false)
  const [expandedParent, setExpandedParent] = useState(null)
  const [expandedChild, setExpandedChild] = useState(null)
  const router = useRouter()
  const allCategories = useSelector(selectAllCategories)

  // Build full category hierarchy with parent -> children -> grandchildren
  const categoryTree = useMemo(() => {
    const categories = allCategories?.data || []

    // Create a map of all categories by ID
    const categoryMap = {}
    categories.forEach((cat) => {
      categoryMap[cat._id] = { ...cat, children: [] }
    })

    // Build tree structure
    const tree = []
    categories.forEach((cat) => {
      if (cat.parent && categoryMap[cat.parent]) {
        categoryMap[cat.parent].children.push(categoryMap[cat._id])
      } else if (!cat.parent) {
        tree.push(categoryMap[cat._id])
      }
    })

    return tree
  }, [allCategories])

  const handleCategoryClick = (category, level, parentId = null) => {
    // Navigate to shop page with category
    router.push(`/shop?category=${category._id}`)
    setShowCategories(false)
  }

  const handleExpandParent = (parent, e) => {
    e.stopPropagation()
    setExpandedParent(expandedParent === parent._id ? null : parent._id)
    setExpandedChild(null)
  }

  const handleExpandChild = (child, e) => {
    e.stopPropagation()
    setExpandedChild(expandedChild === child._id ? null : child._id)
  }

  return (
    <div className="w-full md:max-w-2xl">
      <div className="relative flex items-center h-12 bg-white rounded-md shadow-sm">
        {/* Categories Dropdown */}
        <div className="relative flex-shrink-0 h-full w-full">
          <button
            onClick={() => setShowCategories(!showCategories)}
            className="h-full w-full bg-[#BA8B4E] text-white text-[14px] font-semibold px-4 flex items-center justify-between hover:bg-[#A87D45] transition-colors rounded-md"
          >
            <span>ALL CATEGORIES</span>
            <FaChevronDown
              className={`ml-2 text-[10px] transition-transform ${
                showCategories ? 'rotate-180' : ''
              }`}
            />
          </button>

          {showCategories && (
            <div className="absolute left-0 top-full mt-1 w-full bg-white rounded-md shadow-xl z-[9999] border max-h-96 overflow-y-auto">
              <div className="py-2">
                {categoryTree.map((parent) => (
                  <div key={parent._id} className="mb-1">
                    {/* Parent Header - Click text to navigate, arrow to expand */}
                    <div className="px-4 py-2 bg-gradient-to-r from-[#4dbbd4] to-[#BA8B4E] text-white font-bold text-sm uppercase tracking-wider flex items-center justify-between rounded-lg">
                      <span
                        className="cursor-pointer hover:opacity-80 flex-1"
                        onClick={() => handleCategoryClick(parent, 'parent')}
                      >
                        {parent.name}
                      </span>
                      {parent.children.length > 0 && (
                        <FaChevronRight
                          className={`text-xs w-6 h-6 cursor-pointer hover:opacity-80 p-1 transition-transform ${
                            expandedParent === parent._id ? 'rotate-90' : ''
                          }`}
                          onClick={(e) => handleExpandParent(parent, e)}
                        />
                      )}
                    </div>

                    {/* Children - Shown when parent expanded */}
                    {expandedParent === parent._id &&
                      parent.children.length > 0 && (
                        <div className="bg-gray-50">
                          {parent.children.map((child) => (
                            <div key={child._id}>
                              {/* Child Item - Click text to navigate, arrow to expand */}
                              <div className="px-6 py-2 text-sm text-gray-700 flex items-center justify-between hover:bg-gray-200 border-b border-gray-100">
                                <span
                                  className="font-medium cursor-pointer flex-1"
                                  onClick={() =>
                                    handleCategoryClick(child, 'child')
                                  }
                                >
                                  {child.name}
                                </span>
                                {child.children.length > 0 && (
                                  <FaChevronRight
                                    className={`text-xs w-6 h-6 text-gray-400 cursor-pointer p-1 transition-transform ${
                                      expandedChild === child._id
                                        ? 'rotate-90'
                                        : ''
                                    }`}
                                    onClick={(e) => handleExpandChild(child, e)}
                                  />
                                )}
                              </div>

                              {/* Grandchildren - Shown when child expanded */}
                              {expandedChild === child._id &&
                                child.children.length > 0 && (
                                  <div className="bg-white pl-8 pr-4 py-1">
                                    {child.children.map((grandchild) => (
                                      <a
                                        key={grandchild._id}
                                        href={`/shop?category=${grandchild._id}`}
                                        onClick={(e) => {
                                          e.preventDefault()
                                          handleCategoryClick(
                                            grandchild,
                                            'grandchild',
                                          )
                                        }}
                                        className="block px-3 py-1.5 text-xs text-gray-600 hover:text-[#BA8B4E] transition-colors border-b border-gray-50"
                                      >
                                        {grandchild.name}
                                      </a>
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
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SearchBar
