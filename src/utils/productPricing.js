export const getProductCost = (value) => {
  const cost =
    value?.totalCost ??
    value?.product?.totalCost ??
    value?.productId?.totalCost ??
    0

  const numericCost = Number(cost)
  return Number.isFinite(numericCost) ? numericCost : 0
}
