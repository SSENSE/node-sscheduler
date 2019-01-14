import { Omit } from '../types'
import { Allocated } from './Allocated'
import { CustomSchedule, Schedule } from './Schedule'
import { DailyTimetable } from './Timetable/DailyTimetable'
import { WeeklyTimetable } from './Timetable/WeeklyTimetable'

export { default as getAvailabilities } from './getAvailabilities'
export { default as getIntersection } from './getIntersection'

// prettier-ignore
export interface SSchedulerParams {
  from: string
  to: string
  schedule: Partial<
    & DailyTimetable
    & WeeklyTimetable
    & Schedule
    & CustomSchedule
    & Allocated
  >
  normalize?: boolean
  showUnavailable?: boolean
  duration?: number
  interval?: number
  dateFormat?: string
  parseTimezone?: string
  displayTimezone?: string
}

export type SScheduleIntersectionParams = Omit<SSchedulerParams, 'schedule'> & {
  schedules: Array<SSchedulerParams['schedule']>
}

/**
 * Deprecation notice
 */
export interface TimeAvailability {
  [day: string]: Array<{
    time: string
    available: boolean
  }>
}
