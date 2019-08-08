import { TimeInterval } from '../../types'

export interface Timetable extends TimeInterval {
  unavailability?: TimeInterval[]
}

export {
  default as toDailyScheduleMinsHrs
} from './DailyTimetable/toDailyScheduleMinsHrs'

export {
  default as isWeeklyTimetable
} from './WeeklyTimetable/isWeeklyTimetable'

export { default as timetableToSchedule } from './toSchedule'
