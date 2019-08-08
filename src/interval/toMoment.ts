import * as moment from 'moment-timezone'
import { Interval, MomentInterval } from './types'

const isMomentInterval = (
  interval: Interval | MomentInterval
): interval is MomentInterval =>
  moment.isMoment(interval.from) && moment.isMoment(interval.to)

export default (
  interval: Interval | MomentInterval,
  timezone?: string
): MomentInterval => {
  const setTimezoneMaybe = timezone
    ? (momentDate: moment.Moment) => momentDate.tz(timezone)
    : (I: moment.Moment) => I

  if (isMomentInterval(interval)) return interval

  const [from, to] = [interval.from, interval.to].map(date =>
    setTimezoneMaybe(moment(date))
  )

  return {
    from,
    reference: interval.reference,
    to
  }
}
