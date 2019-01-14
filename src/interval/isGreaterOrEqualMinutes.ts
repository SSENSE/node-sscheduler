import * as moment from 'moment-timezone'
import { MomentInterval } from './types'

export default (target: number, interval: MomentInterval) =>
  moment.duration(interval.to.diff(interval.from)).asMinutes() >= target
