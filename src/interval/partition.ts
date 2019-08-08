// tslint:disable:no-bitwise
import flatMap from '../common/flatMap'
import flatten from '../common/flatten'
import insertMaybe from '../common/insertMaybe'
import createMany from './createMany'
import sort from './sort'
import toMoment from './toMoment'
import { MomentInterval } from './types'

// todo: is this needed?
const validateIntervalSlice = (interval: number) => {
  if (!(60 % (interval % 60))) return true

  throw new Error('interval should evenly partition an hour!')
}

const partitionOne = (
  { from, to, reference }: MomentInterval,
  intervalSliceMinutes: number,
  duration: number
): MomentInterval[] => {
  validateIntervalSlice(intervalSliceMinutes)

  const earliestStartDate = (() => {
    const nextStartPartitionIndex =
      Math.ceil(from.minute() / intervalSliceMinutes) * intervalSliceMinutes

    return from.add(nextStartPartitionIndex - from.minute(), 'minutes')
  })()

  // as float
  const numberOfPartitions = (() => {
    const totalDuration = to.diff(earliestStartDate, 'minutes')

    return (
      Math.min(totalDuration - duration + intervalSliceMinutes, totalDuration) /
      intervalSliceMinutes
    )
  })()

  const intervals = createMany(
    ~~numberOfPartitions,
    earliestStartDate,
    intervalSliceMinutes,
    duration,
    reference
  )

  const rest = (() => {
    if (~~numberOfPartitions === numberOfPartitions) return []

    const dateFrom = earliestStartDate
      .clone()
      .add(~~numberOfPartitions * intervalSliceMinutes + duration, 'minutes')

    return to.diff(dateFrom, 'minutes') >= duration
      ? [
          {
            from: dateFrom,
            ...insertMaybe({ reference }),
            to
          }
        ]
      : []
  })()

  return [...intervals, ...rest]
}

const partitionMany = (
  intervals: MomentInterval[],
  intervalSliceMinutes: number,
  duration: number
): MomentInterval[] =>
  flatMap(
    interval => partitionOne(interval, intervalSliceMinutes, duration),
    sort(intervals)
  )

// !!! TODO: when availabilities are consecutive, merge them into one !!!
// prettier-ignore
export default (
  intervals: MomentInterval[] | MomentInterval,
  intervalSliceMinutes: number,
  duration: number,
): MomentInterval[] =>
  !intervalSliceMinutes
    ? flatten([intervals])
    : Array.isArray(intervals)
      ? partitionMany(intervals, intervalSliceMinutes, duration)
      : partitionOne(intervals, intervalSliceMinutes, duration)
