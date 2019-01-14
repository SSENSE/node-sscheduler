import { Nullable } from '../types'
import { MomentInterval } from './types'

export default (a: Nullable<MomentInterval>, b: Nullable<MomentInterval>) =>
  a && b ? a.to.isSame(b.to) && a.from.isSame(b.from) : !(a || b)
