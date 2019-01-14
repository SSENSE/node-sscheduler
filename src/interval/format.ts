import * as moment from 'moment-timezone'
import insertMaybe from '../common/insertMaybe'
import { Interval, IntervalOptions, MomentInterval } from './types'

import { setDefaultIntervalOptions } from './default/DEFAULT_INTERVAL_OPTIONS'

export default (options: IntervalOptions) => ({
  from,
  to,
  reference
}: Interval | MomentInterval): Interval => {
  const { timezone, format } = setDefaultIntervalOptions(options)

  return {
    from: moment
      .tz(from, timezone)
      .tz(format.timezone)
      .format(format.date),
    ...insertMaybe({ reference }),
    to: moment
      .tz(to, timezone)
      .tz(format.timezone)
      .format(format.date)
  }
}
