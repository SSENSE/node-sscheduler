export { default as toDailyScheduleMinsHrs } from './toDailyScheduleMinsHrs'

import { Timetable } from '..'
import { Day } from '../../../types'

export type DailyTimetable = { [day in Day]?: Partial<Timetable> }
