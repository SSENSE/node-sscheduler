import { Timetable } from '../'

export interface WeeklyTimetable {
  weekdays: Timetable
}

export { default as toDailyTimetable } from './toDailyTimetable'
