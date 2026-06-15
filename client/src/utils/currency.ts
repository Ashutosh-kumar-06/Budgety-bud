/** Format amount in Indian Rupees */
export function formatINR(amount: number, compact = false): string {
  if (compact && amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`
  }
  if (compact && amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function parseINRInput(value: string): number {
  const cleaned = value.replace(/[₹,\s]/g, '')
  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : num
}
