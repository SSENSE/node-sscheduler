import * as moment from 'moment-timezone'
import { MomentInterval } from './types'

/**
 * Returns the two indices of the intervals in `sortedIntervals` that are between a `targetRange`
 */
export default (
  [...sortedIntervals]: MomentInterval[],
  targetRange: MomentInterval
): [number, number] => [
  sortedIntervals.findIndex(interval =>
    moment(interval.to).isAfter(targetRange.from)
  ),
  sortedIntervals
    .reverse()
    .findIndex(interval => moment(interval.from).isBefore(targetRange.to))
]
