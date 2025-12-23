'use client'

export const CategoryFilter = ({
  categories,
  expandedCategories,
  selectedCategories,
  toggleCategory,
  toggleSubcategory,
}) => {
  return (
    <div className="mb-6">
      {categories.map((category) => (
        <div key={category._id} className="mb-2">
          <button
            className="w-full flex justify-between items-center py-2 px-1 text-left text-sm font-medium"
            onClick={() => toggleCategory(category._id)}
          >
            <div className="flex items-center">
              <span className="capitalize">{category.name}</span>
            </div>
            {category.children?.length > 0 && (
              <span className="text-gray-500">
                {expandedCategories[category._id] ? '-' : '+'}
              </span>
            )}
          </button>

          {expandedCategories[category._id] &&
            category.children?.length > 0 && (
              <div className="pl-4 mt-1 space-y-1">
                {category.children.map((subcategory) => (
                  <div key={subcategory._id} className="flex items-center py-1">
                    <input
                      type="checkbox"
                      id={`${category._id}-${subcategory._id}`}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      checked={selectedCategories.includes(subcategory._id)}
                      onChange={() => toggleSubcategory(subcategory._id)}
                    />
                    <label
                      htmlFor={`${category._id}-${subcategory._id}`}
                      className="ml-2 text-sm text-gray-700 capitalize"
                    >
                      {subcategory.name}
                    </label>
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
