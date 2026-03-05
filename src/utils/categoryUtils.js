export const buildCategoryTree = (categories) => {
  if (!Array.isArray(categories)) return []

  const categoryMap = {}
  const rootCategories = []

  // Create a map of all categories
  categories.forEach((category) => {
    categoryMap[category._id] = {
      ...category,
      children: [],
    }
  })

  // Build the tree structure
  categories.forEach((category) => {
    const categoryNode = categoryMap[category._id]

    if (category.parent && categoryMap[category.parent]) {
      // This category has a parent, add it to parent's children
      categoryMap[category.parent].children.push(categoryNode)
    } else {
      // This is a root category
      rootCategories.push(categoryNode)
    }
  })

  return rootCategories
}

export const buildSmartCategoryTree = (categories) => {
  if (!Array.isArray(categories)) return []

  const materialGroups = {}
  const genderGroups = {}
  const productTypes = {}

  // First, categorize all products by material, gender, and type
  categories.forEach((category) => {
    const name = category.name.toLowerCase()

    // Extract material (gold, silver, etc.)
    let material = 'Other'
    if (name.includes('gold')) material = 'Gold'
    else if (name.includes('silver')) material = 'Silver'
    else if (name.includes('platinum')) material = 'Platinum'
    else if (name.includes('diamond')) material = 'Diamond'

    // Extract gender (men, women, unisex)
    let gender = 'Unisex'
    if (name.includes('men') || name.includes('male') || name.includes('boy'))
      gender = 'Men'
    else if (
      name.includes('women') ||
      name.includes('female') ||
      name.includes('girl')
    )
      gender = 'Women'

    // Extract product type (ring, earring, necklace, etc.)
    let productType = 'Other'
    if (name.includes('ring')) productType = 'Ring'
    else if (name.includes('earring')) productType = 'Earring'
    else if (name.includes('necklace')) productType = 'Necklace'
    else if (name.includes('bracelet')) productType = 'Bracelet'
    else if (name.includes('pendant')) productType = 'Pendant'
    else if (name.includes('chain')) productType = 'Chain'
    else if (name.includes('nose pin') || name.includes('nosepin'))
      productType = 'Nose Pin'

    // Store in groups
    if (!materialGroups[material]) {
      materialGroups[material] = {
        _id: `material_${material}`,
        name: material,
        children: [],
      }
    }

    if (!genderGroups[`${material}_${gender}`]) {
      genderGroups[`${material}_${gender}`] = {
        _id: `gender_${material}_${gender}`,
        name: gender,
        children: [],
        parent: `material_${material}`,
      }
      materialGroups[material].children.push(
        genderGroups[`${material}_${gender}`],
      )
    }

    if (!productTypes[`${material}_${gender}_${productType}`]) {
      productTypes[`${material}_${gender}_${productType}`] = {
        _id: `type_${material}_${gender}_${productType}`,
        name: productType,
        children: [],
        parent: `gender_${material}_${gender}`,
      }
      genderGroups[`${material}_${gender}`].children.push(
        productTypes[`${material}_${gender}_${productType}`],
      )
    }

    // Add the actual category to the product type group
    productTypes[`${material}_${gender}_${productType}`].children.push({
      ...category,
      parent: `type_${material}_${gender}_${productType}`,
    })
  })

  // Convert to array and sort
  return Object.values(materialGroups).sort((a, b) => {
    const order = ['Gold', 'Silver', 'Platinum', 'Diamond', 'Other']
    return order.indexOf(a.name) - order.indexOf(b.name)
  })
}

export const flattenCategoryTree = (tree, prefix = '') => {
  const flattened = []

  tree.forEach((category) => {
    const currentPath = prefix ? `${prefix} > ${category.name}` : category.name
    flattened.push({
      ...category,
      path: currentPath,
      level: prefix ? prefix.split(' > ').length : 0,
    })

    if (category.children && category.children.length > 0) {
      flattened.push(...flattenCategoryTree(category.children, currentPath))
    }
  })

  return flattened
}

export const formatCategoryOptions = (categories) => {
  const tree = buildCategoryTree(categories)
  const flattened = flattenCategoryTree(tree)

  return flattened.map((category) => ({
    label: `${'  '.repeat(category.level)}${category.name}`,
    value: category._id,
    level: category.level,
    path: category.path,
  }))
}

export const findCategoryInTree = (tree, categoryId) => {
  for (const category of tree) {
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

export const getCategoryPath = (categories, categoryId) => {
  const categoryMap = {}
  categories.forEach((cat) => {
    categoryMap[cat._id] = cat
  })

  const buildPath = (id) => {
    const category = categoryMap[id]
    if (!category) return ''

    if (category.parentId && categoryMap[category.parentId]) {
      return `${buildPath(category.parentId)} > ${category.name}`
    }
    return category.name
  }

  return buildPath(categoryId)
}
