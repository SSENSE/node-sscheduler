import * as Interval from '../interval'

type normalizeMaybe = (
  normalize: boolean
) => ((
  x: Interval.Interval[],
  options: string | Interval.IntervalOptions
) => Interval.Interval[] | Interval.ByDay)

export const normalizeMaybe: normalizeMaybe = (normalize: boolean) =>
  normalize ? Interval.byDay : I => I
