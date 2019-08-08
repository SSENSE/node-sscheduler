import * as moment from 'moment'
import insertMaybe from '../common/insertMaybe'
import repeat from '../common/repeat'
import { MomentInterval } from './types'

export default (
  n: number,
  startDate: moment.Moment,
  intervalMinutes: number,
  duration: number,
  reference: string | undefined
): MomentInterval[] => {
  return repeat(n).map(index => {
    const from = startDate.clone().add(index * intervalMinutes, 'minutes')
    const to = from.clone().add(duration, 'minutes')

    return {
      from,
      ...insertMaybe({ reference }),
      to
    }
  })
}
