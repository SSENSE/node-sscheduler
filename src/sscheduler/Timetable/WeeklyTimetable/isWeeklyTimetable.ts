import { WeeklyTimetable } from '.'

export default (target: any): target is WeeklyTimetable => !!target.weekdays
