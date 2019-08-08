import * as moment from 'moment-timezone'
import { CustomSchedule } from '.'
import * as Interval from '../../interval'

export default (
  customSchedule: CustomSchedule['custom_schedule'],
  options: Required<Interval.IntervalOptions>
): Interval.Interval[] => {
  moment.tz.setDefault(options.timezone)
  return customSchedule.map(({ from, to, date }) =>
    Interval.format(options)({
      from: `${date}T${from}`,
      to: `${date}T${to}`
    })
  )
}
