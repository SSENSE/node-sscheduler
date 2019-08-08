import { Nullable } from '../types'
import { MomentInterval } from './types'

export default (
  a: Nullable<MomentInterval>,
  b: Nullable<MomentInterval>,
  inclusive = false
) =>
  !!a &&
  !!b &&
  a.from[inclusive ? 'isSameOrBefore' : 'isBefore'](b.from) &&
  a.to[inclusive ? 'isSameOrAfter' : 'isAfter'](b.to)
