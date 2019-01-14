import { isWeeklyTimetable } from '.'
import {
  format,
  Interval,
  MomentInterval,
  RequiredIntervalOptions,
  toMoment
} from '../../interval'
import { Nullable } from '../../types'
import dailyScheduleMinsHrsToSchedule from '../MinsHrs/dailyScheduleMinsHrsToSchedule'
import { getEmptySchedule, Schedule } from '../Schedule'
import * as validate from '../validate'
import * as dailyTimetable from './DailyTimetable'
import * as weeklyTimetable from './WeeklyTimetable'

// todo: needs to validate passed schedule
// to make sure there are no overlaps between days
export default (
  timetable: Nullable<
    dailyTimetable.DailyTimetable | weeklyTimetable.WeeklyTimetable
  >,
  range: Interval,
  options: RequiredIntervalOptions
): Schedule => {
  if (!timetable) return getEmptySchedule()
  // (DailyTimetable | WeeklyTimetable) -> DailyTimetable -> DailyScheduleMinsHrs -> Schedule

  validate.timetable(timetable)
  const formatInterval = format(options)

  const getFormattedInterval = (interval?: MomentInterval) =>
    interval && interval.from.isBefore(interval.to)
      ? [formatInterval(interval)]
      : []

  const momentRange = toMoment(range, options.timezone)

  const daysInRange =
    momentRange.to
      .clone()
      .startOf('day')
      .diff(momentRange.from.clone().startOf('day'), 'days') + 1

  if (daysInRange <= 0) return getEmptySchedule()

  const dailyScheduleMinsHrs = dailyTimetable.toDailyScheduleMinsHrs(
    isWeeklyTimetable(timetable)
      ? weeklyTimetable.toDailyTimetable(timetable)
      : timetable
  )

  return dailyScheduleMinsHrsToSchedule(
    dailyScheduleMinsHrs,
    getFormattedInterval,
    momentRange,
    daysInRange,
    options.timezone
  )
}
