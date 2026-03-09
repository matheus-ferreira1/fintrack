export function formatDate(dateString: string) {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(year!, month! - 1, day!))
}
