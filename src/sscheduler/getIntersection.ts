import { getAvailabilities, SScheduleIntersectionParams } from '.'
import * as Interval from '../interval'
import { normalizeMaybe } from './normalizeMaybe'

const DEFAULT_DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ssZ'

// no need to do Interval intersection since the duration will be the
// same for all schedules
const intersectAll = (availabilities: Interval.Interval[][]) =>
  availabilities.slice(1).reduce<Interval.Interval[]>((acc, intervals) => {
    const uniques = new Set(acc.map(interval => interval.from))
    return intervals.filter(interval => uniques.has(interval.from))
  }, availabilities[0]) as Interval.Interval[]

export default (params: SScheduleIntersectionParams) => {
  const {
    schedules,
    normalize = false,
    parseTimezone = 'UTC',
    displayTimezone = 'UTC',
    dateFormat = DEFAULT_DATE_FORMAT,
    ...scheduleParams
  } = params

  const availabilities = schedules.map(
    schedule =>
      getAvailabilities({
        ...scheduleParams,
        dateFormat,
        normalize: false,
        parseTimezone,
        schedule
      }) as Interval.Interval[]
  )

  return normalizeMaybe(normalize)(
    intersectAll(availabilities).map(
      Interval.format({
        format: { timezone: displayTimezone, date: dateFormat },
        timezone: parseTimezone
      })
    ),
    {
      format: {
        date: dateFormat,
        timezone: displayTimezone
      },
      timezone: parseTimezone
    }
  )
}
