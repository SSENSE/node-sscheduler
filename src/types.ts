import { Interval } from './interval'
import { DateTime } from './sscheduler/DateTime'
export { Interval }

export type Day =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday'

export interface TimeInterval {
  from: string // in HH:mm
  to: string // in HH:mm
  reference?: string
}

export type Unavailability = Array<Interval | DateTime>

export type Nullable<T> = T | null | undefined

export type Omit<T, K> = Pick<T, Exclude<keyof T, K>>
