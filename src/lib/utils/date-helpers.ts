export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

export function formatRelativeTime(date: Date | string): string {
  const d = new Date(date)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`
  
  return formatDate(d)
}

export function getNextMonth(): { year: number; month: number; label: string } {
  const now = new Date()
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  
  return {
    year: nextMonth.getFullYear(),
    month: nextMonth.getMonth(),
    label: nextMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }
}

export function getMonthOptions(): Array<{ value: string; label: string }> {
  const options = []
  const now = new Date()
  
  // Current month
  options.push({
    value: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
    label: now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  })
  
  // Next 6 months
  for (let i = 1; i <= 6; i++) {
    const futureDate = new Date(now.getFullYear(), now.getMonth() + i, 1)
    options.push({
      value: `${futureDate.getFullYear()}-${String(futureDate.getMonth() + 1).padStart(2, '0')}`,
      label: futureDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    })
  }
  
  return options
}

export function isContentForNextMonth(publishingDateTime: Date | null): boolean {
  if (!publishingDateTime) return false
  
  const nextMonth = getNextMonth()
  const contentDate = new Date(publishingDateTime)
  
  return contentDate.getFullYear() === nextMonth.year && 
         contentDate.getMonth() === nextMonth.month
} 