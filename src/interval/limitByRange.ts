import * as moment from 'moment-timezone'
import insertMaybe from '../common/insertMaybe'
import { MomentInterval } from './types'

export default (
  intervals: MomentInterval[],
  range: MomentInterval
): MomentInterval[] => {
  return intervals.reduce<MomentInterval[]>(
    (acc, interval) => [
      ...acc,
      ...[
        {
          from: moment.max(interval.from, range.from),
          ...insertMaybe({ reference: interval.reference }),
          to: moment.min(interval.to, range.to)
        }
      ].filter(interval => interval.from.isBefore(interval.to))
    ],
    []
  )
}
