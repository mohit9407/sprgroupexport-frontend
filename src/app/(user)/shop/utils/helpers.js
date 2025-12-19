export const mapCategories = (categories = []) => {
  const categoryMap = {}
  categories.forEach((category) => {
    categoryMap[category._id] = { ...category, children: [] }
  })

  const categoryTree = []

  categories.forEach((category) => {
    const node = categoryMap[category._id]

    if (category.parent && categoryMap[category.parent]) {
      if (!categoryMap[category.parent].children) {
        categoryMap[category.parent].children = []
      }
      categoryMap[category.parent].children.push(node)
    } else {
      categoryTree.push(node)
    }
  })

  return categoryTree
}

export const getCategoryNameById = (categoryId, categories) => {
  if (!categoryId || !categories) return 'N/A'

  const category = categories.find((cat) => cat._id === categoryId)
  if (category) return category.name

  for (const cat of categories) {
    if (cat.children) {
      const found = cat.children.find((child) => child._id === categoryId)
      if (found) return found.name
    }
  }

  return 'N/A'
}

export const mapProducts = (products = [], allCategories = []) => {
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
