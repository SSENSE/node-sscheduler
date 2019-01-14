import * as moment from 'moment-timezone'

import {
  DEFAULT_INTERVAL_OPTIONS,
  setDefaultIntervalOptions
} from './default/DEFAULT_INTERVAL_OPTIONS'

import { default as _byDay } from './byDay'
import { default as _createMany } from './createMany'
import { default as _format } from './format'
import { default as _hasIntersection } from './hasIntersection'
import { default as _indicesBetween } from './indicesBetween'
import { default as _intersect } from './intersect'
import { default as _isBetween } from './isBetween'
import { default as _isEqual } from './isEqual'
import { default as _isGreaterOrEqual } from './isGreaterOrEqual'
import { default as _isGreaterOrEqualMinutes } from './isGreaterOrEqualMinutes'
import { default as _limitByRange } from './limitByRange'
import { default as _partition } from './partition'
import { default as _sort } from './sort'
import { default as _substract } from './substract'
import toMoment, { default as _toMoment } from './toMoment'

import { Nullable } from '../types'
import {
  ByDay,
  Format,
  Interval,
  IntervalOptions,
  MomentInterval,
  RequiredIntervalOptions
} from './types'

type UnwrapArray<A> = A extends Array<infer B> ? B : A
type WrapArrayMaybe<A, B> = A extends any[] ? B[] : B

type UnwrapNullable<T> = T extends (undefined | null) ? never : T

type WrapNullableMaybe<A, B> = [A] extends [Nullable<infer Z>]
  ? Nullable<Z> extends A
    ? Nullable<B>
    : B
  : B

type MomentIntervalToInterval<T> = UnwrapArray<
  UnwrapNullable<T>
> extends MomentInterval
  ? WrapNullableMaybe<T, WrapArrayMaybe<UnwrapNullable<T>, Interval>>
  : UnwrapArray<T> extends MomentInterval
  ? WrapArrayMaybe<T, Interval>
  : T

const isIntervals = (intervals: any): intervals is Interval[] =>
  typeof intervals[0].from === 'string' && typeof intervals[0].to === 'string'

const isInterval = (interval: any): interval is Interval =>
  typeof interval.from === 'string' && typeof interval.to === 'string'

// prettier-ignore
const toMomentIntervals = <T>(intervals: T[]) => (
  intervals.length && isIntervals(intervals)
    ? intervals.map((interval: Interval) => _toMoment(interval))
    : intervals
) as T[] extends Interval[] ? Interval[] : T[]

// prettier-ignore
function withTimezoneAndFormat<T1>(
  fn: (a1: T1) => MomentInterval[]
): (
  a1: MomentIntervalToInterval<T1>,
  options: IntervalOptions
) => Interval[]

function withTimezoneAndFormat<T1, T2>(
  fn: (a1: T1, a2: T2) => MomentInterval[]
): (
  a1: MomentIntervalToInterval<T1>,
  a2: MomentIntervalToInterval<T2>,
  options: IntervalOptions
) => Interval[]

function withTimezoneAndFormat<T1, T2, T3>(
  fn: (a1: T1, a2: T2, a3: T3) => MomentInterval[]
): (
  a1: MomentIntervalToInterval<T1>,
  a2: MomentIntervalToInterval<T2>,
  a3: MomentIntervalToInterval<T3>,
  options: IntervalOptions
) => Interval[]

function withTimezoneAndFormat<T1, T2, T3, T4>(
  fn: (a1: T1, a2: T2, a3: T3, a4: T4) => MomentInterval[]
): (
  a1: MomentIntervalToInterval<T1>,
  a2: MomentIntervalToInterval<T2>,
  a3: MomentIntervalToInterval<T3>,
  a4: MomentIntervalToInterval<T4>,
  options: IntervalOptions
) => Interval[]

function withTimezoneAndFormat<T1, T2, T3, T4, T5>(
  fn: (a1: T1, a2: T2, a3: T3, a4: T4, a5: T5) => MomentInterval[]
): (
  a1: MomentIntervalToInterval<T1>,
  a2: MomentIntervalToInterval<T2>,
  a3: MomentIntervalToInterval<T3>,
  a4: MomentIntervalToInterval<T4>,
  a5: MomentIntervalToInterval<T5>,
  options: IntervalOptions
) => Interval[]

function withTimezoneAndFormat(fn: (...args: any[]) => MomentInterval[]) {
  return (...args: any[]) => {
    const options =
      args.length <= fn.length
        ? DEFAULT_INTERVAL_OPTIONS
        : setDefaultIntervalOptions(args.pop())

    moment.tz.setDefault(options.timezone)
    ;(moment.defaultFormat as any) = (moment.defaultFormatUtc as any) = options.format.date
    const transformedArgs = args.map(arg =>
      Array.isArray(arg)
        ? toMomentIntervals(arg)
        : isInterval(arg)
        ? toMoment(arg)
        : arg
    )

    return fn(...transformedArgs).map(_format(options))
  }
}

// prettier-ignore
function withTimezone<T1, R>(
  fn: (a1: T1) => R
): (
  a1: MomentIntervalToInterval<T1>,
  options: IntervalOptions | string
) => R

function withTimezone<T1, T2, R>(
  fn: (a1: T1, a2: T2) => R
): (
  a1: MomentIntervalToInterval<T1>,
  a2: MomentIntervalToInterval<T2>,
  options: IntervalOptions | string
) => R

function withTimezone<T1, T2, T3, R>(
  fn: (a1: T1, a2: T2, a3: T3) => R
): (
  a1: MomentIntervalToInterval<T1>,
  a2: MomentIntervalToInterval<T2>,
  a3: MomentIntervalToInterval<T3>,
  options: IntervalOptions | string
) => R

function withTimezone<T1, T2, T3, T4, R>(
  fn: (a1: T1, a2: T2, a3: T3, a4: T4) => R
): (
  a1: MomentIntervalToInterval<T1>,
  a2: MomentIntervalToInterval<T2>,
  a3: MomentIntervalToInterval<T3>,
  a4: MomentIntervalToInterval<T4>,
  options: IntervalOptions | string
) => R

function withTimezone<T1, T2, T3, T4, T5, R>(
  fn: (a1: T1, a2: T2, a3: T3, a4: T4, a5: T5) => R
): (
  a1: MomentIntervalToInterval<T1>,
  a2: MomentIntervalToInterval<T2>,
  a3: MomentIntervalToInterval<T3>,
  a4: MomentIntervalToInterval<T4>,
  a5: MomentIntervalToInterval<T5>,
  options: IntervalOptions | string
) => R

function withTimezone(fn: (...args: any[]) => any) {
  const hasTimezone = (opts: any): opts is IntervalOptions =>
    typeof opts.timezone === 'string'

  const getTimezone = (opts: IntervalOptions | string) =>
    hasTimezone(opts)
      ? opts.timezone
      : typeof opts === 'string'
      ? opts
      : DEFAULT_INTERVAL_OPTIONS.timezone

  return (...args: any[]) => {
    const timezone =
      args.length <= fn.length
        ? DEFAULT_INTERVAL_OPTIONS.timezone
        : getTimezone(args.pop()) || DEFAULT_INTERVAL_OPTIONS.timezone

    moment.tz.setDefault(timezone)

    const transformedArgs = args.map(arg =>
      Array.isArray(arg)
        ? toMomentIntervals(arg)
        : isInterval(arg)
        ? toMoment(arg)
        : arg
    )

    return fn(...transformedArgs)
  }
}

const byDay = withTimezone(_byDay)
const createMany = withTimezoneAndFormat(_createMany)
const indicesBetween = withTimezone(_indicesBetween)
const intersect = withTimezoneAndFormat(_intersect)
const hasIntersection = withTimezone(_hasIntersection)
const isBetween = withTimezone(_isBetween)
const isEqual = withTimezone(_isEqual)
const isGreaterOrEqual = withTimezone(_isGreaterOrEqual)
const isGreaterOrEqualMinutes = withTimezone(_isGreaterOrEqualMinutes)
const limitByRange = withTimezoneAndFormat(_limitByRange)
const partition = withTimezoneAndFormat(_partition)
const substract = withTimezoneAndFormat(_substract)

const sort = (
  intervals: Interval[],
  options: IntervalOptions,
  reverse = false
): MomentInterval[] =>
  ((withTimezone(_sort) as any) as typeof sort)(intervals, options, reverse)

export {
  ByDay,
  Format,
  Interval,
  IntervalOptions,
  MomentInterval,
  RequiredIntervalOptions,
  byDay,
  createMany,
  hasIntersection,
  intersect,
  indicesBetween,
  isBetween,
  isEqual,
  isGreaterOrEqual,
  isGreaterOrEqualMinutes,
  limitByRange,
  partition,
  sort,
  substract,
  _toMoment as toMoment,
  _format as format
}
