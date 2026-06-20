import { formatDistanceToNowStrict } from 'date-fns'

export function formatAmount(amount) {
  return amount.toFixed(2).replace('.', ',')
}

export function formatPrice(amount) {
  return `€${formatAmount(amount)}`
}

export function formatRelativeTime(timestamp) {
  const time = typeof timestamp === 'number' ? timestamp : new Date(timestamp).getTime()
  const diff = Date.now() - time
  if (diff < 60_000) return 'Just now'
  return formatDistanceToNowStrict(time, { addSuffix: true })
}
