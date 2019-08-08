import { DailyTimetable } from '.'
import { Timetable } from '..'
import { Day } from '../../../types'
import {
  DailyScheduleMinsHrs,
  intervalToMinsHrs,
  ScheduleMinsHrs
} from '../../MinsHrs'

import { DAYS_OF_THE_WEEK } from '../../const'

const timetableToScheduleMinsHrs = ({
  unavailability = [],
  ...availability
}: Timetable): ScheduleMinsHrs => ({
  ...intervalToMinsHrs(availability),
  unavailability: unavailability.map(unavailability =>
    intervalToMinsHrs(unavailability)
  )
})

export default (times: DailyTimetable) =>
  (Object.keys(times) as Array<keyof DailyTimetable>).reduce(
    (acc, dayOfTheWeek) => ({
      ...acc,
      [DAYS_OF_THE_WEEK.indexOf(
        dayOfTheWeek.toUpperCase() as Day
      )]: timetableToScheduleMinsHrs(times[dayOfTheWeek] as Timetable)
    }),
    {}
  ) as DailyScheduleMinsHrs
