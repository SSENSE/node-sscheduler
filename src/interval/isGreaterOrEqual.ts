import { Nullable } from '../types'
import { MomentInterval } from './types'

export default (a: Nullable<MomentInterval>, b: Nullable<MomentInterval>) =>
  a && b ? a.to.diff(a.from, 'minutes') >= b.to.diff(b.from, 'minutes') : !a
