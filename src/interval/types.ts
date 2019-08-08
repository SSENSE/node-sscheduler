import * as moment from 'moment-timezone'

export interface ByDay {
  [day: string]: string[]
}

export interface IntervalOptions {
  timezone?: string
  format?: Format
}

export interface RequiredIntervalOptions {
  timezone: string
  format: Required<Format>
}

export interface Format {
  date?: string
  timezone?: string
}

export interface Interval {
  from: string
  to: string
  reference?: string
}

export interface MomentInterval {
  from: moment.Moment
  to: moment.Moment
  reference?: string
}
