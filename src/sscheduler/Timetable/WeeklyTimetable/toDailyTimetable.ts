import { WeeklyTimetable } from '.'
import { WEEKDAYS } from '../../const'
import { DailyTimetable } from '../DailyTimetable'

export default ({ weekdays: { from, to, unavailability } }: WeeklyTimetable) =>
  WEEKDAYS.reduce(
    (acc, day) => ({
      ...acc,
      [day]: { from, to, unavailability }
    }),
    {}
  ) as DailyTimetable
