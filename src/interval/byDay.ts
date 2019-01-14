import { ByDay, MomentInterval } from './types'

export default (intervals: MomentInterval[]): ByDay =>
  intervals.reduce<ByDay>((acc, interval) => {
    const { from } = interval
    const [day, time] = [from.format('YYYY-MM-DD'), from.format('HH:mm')]

    return {
      ...acc,
      [day]: [...new Set((acc[day] || []).concat(time))]
    }
  }, {})
