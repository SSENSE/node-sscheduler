import * as moment from 'moment-timezone'
import { MinsHrs } from '.'
import { Interval } from '../../types'

export default (interval: Interval): MinsHrs => ({
  from: {
    hour: moment(interval.from, 'hh:mm').hour(),
    minute: moment(interval.from, 'hh:mm').minute()
  },
  to: {
    hour: moment(interval.to, 'hh:mm').hour(),
    minute: moment(interval.to, 'hh:mm').minute()
  }
})
