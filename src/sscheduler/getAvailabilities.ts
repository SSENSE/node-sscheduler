import * as moment from 'moment-timezone'
import { SSchedulerParams, TimeAvailability as TimeAvailabilities } from '.'
import * as Interval from '../interval'
import { setDefaultIntervalOptions } from '../interval/default/DEFAULT_INTERVAL_OPTIONS'
import * as Allocated from './Allocated'
import * as DateTime from './DateTime'
import { getFreeTimeSlots } from './getFreeTimeSlots'
import { normalizeMaybe } from './normalizeMaybe'
import { Schedule } from './Schedule'
import customScheduleToInterval from './Schedule/customScheduleToInterval'
import { Timetable } from './Timetable'
import { DailyTimetable } from './Timetable/DailyTimetable'
import timetableToSchedule from './Timetable/toSchedule'
import * as Validate from './validate'

const DEFAULT_INTERVAL = 0
const DEFAULT_DURATION = 0

export default ({
  from,
  to,
  schedule: {
    availability = [],
    unavailability = [],
    allocated = [],
    custom_schedule = [],
    weekdays,
    ...dailyTimetable
  },
  interval = DEFAULT_INTERVAL,
  duration = DEFAULT_DURATION,
  showUnavailable = false,
  normalize = false,
  parseTimezone,
  displayTimezone,
  dateFormat
}: SSchedulerParams):
  | Interval.ByDay
  | Interval.Interval[]
  | TimeAvailabilities => {
  const userFormatOptions = setDefaultIntervalOptions({
    format: {
      date: dateFormat,
      timezone: displayTimezone
    },
    timezone: parseTimezone
  })

  // this is needed to not lose date information when using user supplied formating options
  const defaultFormatOptions = setDefaultIntervalOptions({
    timezone: parseTimezone
  })

  moment.tz.setDefault(userFormatOptions.timezone)

  validateParams(from, to, interval, duration, unavailability, allocated)

  const { availabilities, unavailabilities } = removeAllOverlaps(
    parseTimetables(weekdays, from, to, defaultFormatOptions, dailyTimetable),
    customScheduleToInterval(custom_schedule, defaultFormatOptions),
    availability,
    DateTime.toInterval(unavailability),
    Allocated.toInterval(allocated),
    defaultFormatOptions
  )

  // get non-partitioned availabilities
  const freeTimeSlots = getFreeTimeSlots(
    availabilities,
    unavailabilities,
    { from, to },
    Math.max(duration, interval),
    defaultFormatOptions
  )

  return showUnavailable
    ? getTimeAvailabilities(
        { from, to },
        freeTimeSlots,
        interval,
        duration,
        userFormatOptions
      )
    : normalizeMaybe(normalize)(
        Interval.partition(
          freeTimeSlots,
          interval,
          duration,
          userFormatOptions
        ),
        userFormatOptions
      )
}

const getTimeAvailabilities = (
  range: Interval.Interval,
  freeTimeSlots: Interval.Interval[],
  intervalSliceMinutes: number,
  duration: number,
  options: Interval.IntervalOptions
): TimeAvailabilities => {
  const rangeIntervals = Interval.partition(
    range,
    intervalSliceMinutes,
    duration,
    options
  )

  const availabilitiesByDay = Interval.byDay(
    Interval.partition(freeTimeSlots, intervalSliceMinutes, duration, options),
    options
  )

  const getTimeAndDay = (day: string) => {
    const momentDay = moment(day)
    return {
      date: momentDay.format('YYYY-MM-DD'),
      time: momentDay.format('HH:mm')
    }
  }

  return rangeIntervals.reduce<TimeAvailabilities>((byDay, interval) => {
    const { date, time } = getTimeAndDay(interval.from)
    const timeAvailability = {
      available: (availabilitiesByDay[date] || []).some(
        _time => _time === time
      ),
      time
    }

    return {
      ...byDay,
      [date]: (byDay[date] || []).concat(timeAvailability)
    }
  }, {})
}

const validateParams = (
  from: string,
  to: string,
  interval: number,
  duration: number,
  unavailability: Array<Interval.Interval | DateTime.DateTime>,
  allocated: Allocated.Allocation[]
) => {
  Validate.range(from, to)
  Validate.interval(interval)
  Validate.duration(duration)
  Validate.unavailability(unavailability)
  Validate.allocated(allocated)
}

// removes arrays of Intervals that overlap with other arrays of Intervals
// move and improve performance
const _removeOverlaps = (options: Interval.IntervalOptions) => (
  ...intervalSets: Interval.Interval[][]
) =>
  intervalSets
    .slice(1)
    .reduce<Interval.Interval[]>(
      (acc, intervals) =>
        intervals.concat(
          acc.filter(
            interval =>
              !intervals.some(overrideInterval =>
                Interval.hasIntersection(interval, overrideInterval, options)
              )
          )
        ),
      intervalSets[0]
    )

const removeAllOverlaps = (
  { weeklySchedule, dailySchedule }: { [_: string]: Schedule },
  customSchedule: Interval.Interval[],
  availability: Interval.Interval[],
  unavailability: Interval.Interval[],
  allocated: Interval.Interval[],
  defaultFormatOptions: Interval.IntervalOptions
) => {
  const removeOverlaps = _removeOverlaps(defaultFormatOptions)

  // todo: document the order of removing the overlaps.
  // this is important because Intervals that come later override the ones that come before
  return {
    availabilities: removeOverlaps(
      weeklySchedule.availability,
      dailySchedule.availability,
      availability,
      customSchedule
    ),
    unavailabilities: removeOverlaps(
      weeklySchedule.unavailability,
      dailySchedule.unavailability,
      unavailability,
      allocated
    )
  }
}

const parseTimetables = (
  weekdays: Timetable | undefined,
  from: string,
  to: string,
  defaultFormatOptions: Interval.RequiredIntervalOptions,
  dailyTimetable: DailyTimetable
) => ({
  dailySchedule: timetableToSchedule(
    dailyTimetable,
    { from, to },
    defaultFormatOptions
  ),
  weeklySchedule: timetableToSchedule(
    weekdays && { weekdays },
    { from, to },
    defaultFormatOptions
  )
})
