import * as moment from 'moment-timezone'
import { Allocation } from '.'
import * as Interval from '../../interval'

export default (allocated: Allocation[]): Interval.Interval[] =>
  allocated.map(({ from, duration }) => ({
    from: moment(from).format(),
    to: moment(from)
      .add(duration, 'minutes')
      .format()
  }))
