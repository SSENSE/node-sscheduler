import { DateTime, isDateTime } from '.'
import * as Interval from '../../interval'

export default (
  intervalsOrDateTime: Array<Interval.Interval | DateTime>
): Interval.Interval[] =>
  intervalsOrDateTime.map(interval =>
    isDateTime(interval)
      ? {
          from: `${interval.date}T${interval.from}`,
          to: `${interval.date}T${interval.to}`
        }
      : interval
  )
