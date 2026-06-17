import { endOfWeek, format, startOfWeek } from 'date-fns'

/** European week: Monday = first day (date-fns weekStartsOn: 1). */
export const WEEK_STARTS_ON = 1

export const WEEK_OPTIONS = { weekStartsOn: WEEK_STARTS_ON }

export const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export const WEEKDAY_LABELS_SHORT = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export function formatWeekRange(date, options = WEEK_OPTIONS) {
  const start = startOfWeek(date, options)
  const end = endOfWeek(date, options)
  const sameMonth = start.getMonth() === end.getMonth()
  if (sameMonth) {
    return `${format(start, 'd')} – ${format(end, 'd MMM')}`
  }
  return `${format(start, 'd MMM')} – ${format(end, 'd MMM')}`
}
