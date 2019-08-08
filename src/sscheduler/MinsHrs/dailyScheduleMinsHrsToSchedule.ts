import * as moment from 'moment-timezone'
import { DailyScheduleMinsHrs, MinsHrs } from '.'
import flatMap from '../../common/flatMap'
import repeat from '../../common/repeat'
import { Interval, MomentInterval } from '../../interval'
import { getEmptySchedule, Schedule } from '../Schedule'

const createMomentInterval = (
  newDay: moment.Moment,
  momentRange: MomentInterval,
  { from, to }: MinsHrs
): MomentInterval => ({
  from: moment.max(
    newDay
      .clone()
      .hour(from.hour)
      .minute(from.minute)
      .second(0)
      .millisecond(0),
    momentRange.from
  ),
  to: moment.min(
    newDay
      .clone()
      .dayOfYear(
        newDay.dayOfYear() +
          // for schedules that wrap around to the next day, add 1 to the day
          +moment(`${from.hour}:${from.minute}`, 'hh:mm').isAfter(
            moment(`${to.hour}:${to.minute}`, 'hh:mm')
          )
      )
      .hour(to.hour)
      .minute(to.minute)
      .second(0)
      .millisecond(0),
    momentRange.to
  )
})

/**
 * Given a dailySchedule in MinsHrs and a specific day
 * returns the Schedule on that day.
 */
const getScheduleOnDay = (
  day: moment.Moment,
  dailyScheduleMinsHrs: DailyScheduleMinsHrs,
  momentRange: MomentInterval,
  getFormattedInterval: (interval?: MomentInterval) => Interval[]
): Schedule => {
  const scheduleMinsHrs = dailyScheduleMinsHrs[day.weekday()]
  if (!scheduleMinsHrs) return getEmptySchedule()

  return {
    availability: getFormattedInterval(
      scheduleMinsHrs.from &&
        scheduleMinsHrs.to &&
        createMomentInterval(day, momentRange, scheduleMinsHrs)
    ),
    unavailability: flatMap(
      getFormattedInterval,
      scheduleMinsHrs.unavailability.map(interval =>
        createMomentInterval(day, momentRange, interval)
      )
    )
  }
}

export default (
  dailyScheduleMinsHrs: DailyScheduleMinsHrs,
  getFormattedInterval: (interval?: MomentInterval) => Interval[],
  momentRange: MomentInterval,
  daysInRange: number,
  timezone: string
): Schedule =>
  repeat(daysInRange).reduce<Schedule>((acc, dayIndex) => {
    const { availability, unavailability } = getScheduleOnDay(
      momentRange.from
        .clone()
        .add(dayIndex, 'days')
        .tz(timezone),
      dailyScheduleMinsHrs,
      momentRange,
      getFormattedInterval
    )

    return {
      availability: [...acc.availability, ...availability],
      unavailability: [...acc.unavailability, ...unavailability]
    }
  }, getEmptySchedule())
