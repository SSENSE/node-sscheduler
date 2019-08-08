import * as Interval from '../interval'

export const getFreeTimeSlots = (
  availability: Interval.Interval[],
  unavailability: Interval.Interval[],
  targetRange: Interval.Interval,
  minimumInterval: number,
  options: Interval.IntervalOptions
): Interval.Interval[] =>
  Interval.substract(
    Interval.limitByRange(availability, targetRange, options),
    unavailability,
    options
  ).filter(interval =>
    Interval.isGreaterOrEqualMinutes(minimumInterval, interval, options)
  )
