export const getProductCost = (value) => {
  const totalCost = [
    value?.totalCost,
    value?.product?.totalCost,
    value?.productId?.totalCost,
  ]
    .map(Number)
    .find((cost) => Number.isFinite(cost) && cost > 0)

  if (totalCost !== undefined) return totalCost

  const price = [value?.price, value?.product?.price, value?.productId?.price]
    .map(Number)
    .find((amount) => Number.isFinite(amount))

  return price ?? 0
}
