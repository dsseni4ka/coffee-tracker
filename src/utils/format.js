export function formatAmount(amount) {
  return amount.toFixed(2).replace('.', ',')
}

export function formatPrice(amount) {
  return `€${formatAmount(amount)}`
}
