import * as moment from 'moment-timezone'

interface WeeklySchedule {
  sunday?: Schedule
  monday?: Schedule
  tuesday?: Schedule
  wednesday?: Schedule
  thursday?: Schedule
  friday?: Schedule
  saturday?: Schedule
  weekdays?: Schedule
  unavailability?: Interval[] | ScheduleSpecificDate[]
  allocated?: Allocated[]
  custom_schedule?: ScheduleSpecificDate[]
}

interface Interval {
  from: string | moment.Moment
  to: string | moment.Moment
  reference?: any
}

export interface ScheduleSpecificDate extends Interval {
  date: string | moment.Moment
}

interface Allocated {
  from: string | moment.Moment
  duration: number
  to?: moment.Moment
}

interface Schedule extends Interval {
  unavailability?: Interval[]
}

export interface TimeAvailability {
  time: string
  available: boolean
  reference?: any
}

export interface Availability {
  [date: string]: TimeAvailability[]
}

interface Params {
  from: string | moment.Moment
  to: string | moment.Moment
  interval: number
  duration: number
}

export interface AvailabilityParams extends Params {
  schedule: WeeklySchedule
}

export interface IntersectParams extends Params {
  schedules: WeeklySchedule[]
}

export class Scheduler {
  constructor()

  isTimeBefore(first: moment.Moment, second: moment.Moment): boolean
  isTimeSameOrAfter(first: moment.Moment, second: moment.Moment): boolean
  isTimeAfter(first: moment.Moment, second: moment.Moment): boolean
  isTimeslotAvailable(
    timeSlotStart: moment.Moment,
    timeSlotEnd: moment.Moment,
    allocateds: any[]
  ): boolean

  isDateTimeBefore(first: moment.Moment, second: moment.Moment): boolean
  isDateTimeSameOrAfter(first: moment.Moment, second: moment.Moment): boolean
  isDateTimeAfter(first: moment.Moment, second: moment.Moment): boolean
  isDateTimeslotAvailable(
    dateSlotStart: moment.Moment,
    dateSlotEnd: moment.Moment,
    allocateds: any[]
  ): boolean

  getAvailability(params: AvailabilityParams): Availability
  getIntersection(params: IntersectParams): Availability
}
