import { MomentInterval } from './types'

export default (
  [...intervals]: MomentInterval[],
  reverse = false
): MomentInterval[] =>
  intervals.sort((a, b) => (-1) ** +(reverse || false) * a.from.diff(b.from))
