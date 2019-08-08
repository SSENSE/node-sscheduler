import * as moment from 'moment-timezone'
import { Unavailability } from '../types'
import { Allocation } from './Allocated'
import { DateTime } from './DateTime'
import { Timetable } from './Timetable'
import { DailyTimetable } from './Timetable/DailyTimetable'
import { WeeklyTimetable } from './Timetable/WeeklyTimetable'

const ISO8601 = (date: string, name: string, context: string) => {
  if (!moment(date, moment.ISO_8601).isValid()) {
    throw new Error(
      `${context ? context + ' ' : ''}"${name}" must be a valid ISO 8601 string`
    )
  }
}

const time = (time: string, name: string, context: string) => {
  if (!moment(time, 'hh:mm').isValid()) {
    throw new Error(
      `${
        context ? context + ' ' : ''
      }"${name}" must be a time in the format HH:mm`
    )
  }
}

const greaterThan = (from: string, to: string, context: string) => {
  if (!moment(from, moment.ISO_8601).isBefore(to)) {
    throw new Error(
      `${context ? context + ' ' : ''}"to" must be greater than "from"`
    )
  }
}

const greaterThanTime = (from: string, to: string, context: string) => {
  if (!moment(from, 'hh:mm').isBefore(moment(to, 'hh:mm'))) {
    throw new Error(
      `${context ? context + ' ' : ''}"to" must be greater than "from"`
    )
  }
}

const positiveInteger = (duration: number, name: string, context: string) => {
  if (!(Number.isInteger(duration) && duration >= 0)) {
    throw new Error(
      `${context ? context + ' ' : ''}"${name}" must be a positive integer`
    )
  }
}

export const range = (from: string, to: string) => {
  ISO8601(from, 'from', '')
  ISO8601(to, 'to', '')
  greaterThan(from, to, '')
}

export const unavailability = (unavailability: Unavailability) => {
  const validateOne = (from: string, to: string, date: string) => {
    if (!date) {
      ISO8601(from, 'from', 'unavailability')
      ISO8601(to, 'to', 'unavailability')
      greaterThan(from, to, 'unavailability')
    } else {
      ISO8601(date, 'date', 'unavailability')
      time(from, 'from', 'unavailability')
      time(to, 'to', 'unavailability')
      greaterThanTime(from, to, 'unavailability')
    }
  }

  unavailability.forEach(one =>
    validateOne(one.from, one.to, (one as DateTime).date)
  )
}

export const allocated = (allocated: Allocation[]) => {
  allocated.forEach(allocated => {
    ISO8601(allocated.from, 'allocated.from', '')
    positiveInteger(allocated.duration, 'allocated.duration', '')
  })
}

export const interval = (interval: number) => {
  positiveInteger(interval, 'interval', '')
}

export const duration = (duration: number) => {
  positiveInteger(duration, 'duration', '')
}

export const timetable = (timetable: DailyTimetable | WeeklyTimetable) => {
  const validateDay = (day: string, timetable: Timetable) => {
    if (timetable.from && timetable.to) {
      time(timetable.from, 'from', `${day}:`)
      time(timetable.to, 'to', `${day}:`)
    }

    if (timetable.unavailability) {
      timetable.unavailability.forEach(times => {
        time(times.from, 'from', `${day}: unavailability`)
        time(times.to, 'to', `${day}: unavailability`)
      })
    }
  }
  ;(Object.keys(timetable) as Array<keyof DailyTimetable>).forEach(
    (day: keyof DailyTimetable) =>
      validateDay(day, (timetable as DailyTimetable)[day] as Timetable)
  )
}
