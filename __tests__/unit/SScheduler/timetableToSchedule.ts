// tslint:disable:object-literal-sort-keys
import { format, Interval } from '../../../src/interval'
import timetableToSchedule from '../../../src/sscheduler/Timetable/toSchedule'
import { TimeInterval } from '../../../src/types'
import '../../pretest'

const DEFAULT_DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ssZ'

const UTC_OPTIONS = {
  timezone: 'UTC',
  format: {
    date: DEFAULT_DATE_FORMAT,
    timezone: 'UTC'
  }
}

const EST_OPTIONS = {
  timezone: 'EST',
  format: {
    date: DEFAULT_DATE_FORMAT,
    timezone: 'UTC'
  }
}

describe('timetableToSchedule', () => {
  it('Should convert a single day to an interval between a range', () => {
    const days = {
      Monday: {
        from: '09:00',
        to: '17:00'
      }
    }

    const range = {
      from: '2018-12-13T00:00:00+00:00',
      to: '2018-12-25T00:00:00+00:00'
    }

    const availability = [
      { from: '2018-12-17T09:00:00+00:00', to: '2018-12-17T17:00:00+00:00' },
      { from: '2018-12-24T09:00:00+00:00', to: '2018-12-24T17:00:00+00:00' }
    ]

    timetableToSchedule(days, range, UTC_OPTIONS).should.eql({
      availability,
      unavailability: []
    })
  })

  it('Should cut off days that end after range ends', () => {
    const days = {
      Monday: {
        from: '09:00',
        to: '17:00'
      }
    }

    const range = {
      from: '2018-12-13T00:00:00+00:00',
      to: '2018-12-24T09:30:00+00:00'
    }

    const availability = [
      { from: '2018-12-17T09:00:00+00:00', to: '2018-12-17T17:00:00+00:00' },
      { from: '2018-12-24T09:00:00+00:00', to: '2018-12-24T09:30:00+00:00' }
    ]

    timetableToSchedule(days, range, UTC_OPTIONS).should.eql({
      availability,
      unavailability: []
    })
  })

  it('Should cut off days that start before range starts', () => {
    const days = {
      Monday: {
        from: '09:00',
        to: '17:00'
      }
    }

    const range = {
      from: '2018-12-17T13:00:00+00:00',
      to: '2018-12-25T09:30:00+00:00'
    }

    const availability = [
      { from: '2018-12-17T13:00:00+00:00', to: '2018-12-17T17:00:00+00:00' },
      { from: '2018-12-24T09:00:00+00:00', to: '2018-12-24T17:00:00+00:00' }
    ]

    timetableToSchedule(days, range, UTC_OPTIONS).should.eql({
      availability,
      unavailability: []
    })
  })

  it('Should not cut off when day ends exactly at the end of the range', () => {
    const days = {
      Monday: {
        from: '09:00',
        to: '17:00'
      }
    }

    const range = {
      from: '2018-12-17T09:00:00+00:00',
      to: '2018-12-24T17:00:00+00:00'
    }

    const availability = [
      { from: '2018-12-17T09:00:00+00:00', to: '2018-12-17T17:00:00+00:00' },
      { from: '2018-12-24T09:00:00+00:00', to: '2018-12-24T17:00:00+00:00' }
    ]

    timetableToSchedule(days, range, UTC_OPTIONS).should.eql({
      availability,
      unavailability: []
    })
  })

  it('Should cut off day when range is one day and does not cover full day', () => {
    const days = {
      Monday: {
        from: '09:00',
        to: '17:00'
      }
    }

    const range = {
      from: '2018-12-17T12:00:00+00:00',
      to: '2018-12-17T18:00:00+00:00'
    }

    const availability = [
      { from: '2018-12-17T12:00:00+00:00', to: '2018-12-17T17:00:00+00:00' }
    ]

    timetableToSchedule(days, range, UTC_OPTIONS).should.eql({
      availability,
      unavailability: []
    })
  })

  it('Should not include days that start after range ends', () => {
    const days = {
      Monday: {
        from: '09:00',
        to: '17:00'
      }
    }

    const range = {
      from: '2018-12-13T00:00:00+00:00',
      to: '2018-12-24T08:30:00+00:00'
    }

    const availability = [
      { from: '2018-12-17T09:00:00+00:00', to: '2018-12-17T17:00:00+00:00' }
    ]

    timetableToSchedule(days, range, UTC_OPTIONS).should.eql({
      availability,
      unavailability: []
    })
  })

  it('Should not include days that end after range starts', () => {
    const days = {
      Monday: {
        from: '09:00',
        to: '17:00'
      }
    }

    const range = {
      from: '2018-12-17T17:00:00+00:00',
      to: '2018-12-25T12:00:00+00:00'
    }

    const availability = [
      { from: '2018-12-24T09:00:00+00:00', to: '2018-12-24T17:00:00+00:00' }
    ]

    timetableToSchedule(days, range, UTC_OPTIONS).should.eql({
      availability,
      unavailability: []
    })
  })

  it('Should convert everything in given timezone', () => {
    const days = {
      Monday: {
        from: '09:00', // in EST
        to: '21:00'
      }
    }

    const range = {
      from: '2018-12-17T17:00:00+00:00',
      to: '2018-12-25T12:00:00+00:00'
    }

    const availability = [
      { from: '2018-12-17T17:00:00+00:00', to: '2018-12-18T02:00:00+00:00' },
      { from: '2018-12-24T14:00:00+00:00', to: '2018-12-25T02:00:00+00:00' }
    ]

    const { availability: rAvailability } = timetableToSchedule(
      days,
      range,
      EST_OPTIONS
    )

    rAvailability.should.eql(availability)
  })

  it('Should allow schedule that wraps over to next day', () => {
    const days = {
      Monday: {
        from: '19:00',
        to: '02:00'
      }
    }

    const range = {
      from: '2018-12-17T17:00:00+00:00',
      to: '2018-12-25T01:00:00+00:00'
    }

    const availability = [
      { from: '2018-12-17T19:00:00+00:00', to: '2018-12-18T02:00:00+00:00' },
      { from: '2018-12-24T19:00:00+00:00', to: '2018-12-25T01:00:00+00:00' }
    ]

    timetableToSchedule(days, range, UTC_OPTIONS).should.eql({
      availability,
      unavailability: []
    })
  })

  it('Should allow schedule that wraps over to next day at the end of the year', () => {
    const days = {
      Monday: {
        from: '19:00',
        to: '02:00'
      }
    }

    const range = {
      from: '2018-12-28T17:00:00+00:00',
      to: '2019-01-03T01:00:00+00:00'
    }

    const availability = [
      { from: '2018-12-31T19:00:00+00:00', to: '2019-01-01T02:00:00+00:00' }
    ]

    timetableToSchedule(days, range, UTC_OPTIONS).should.eql({
      availability,
      unavailability: []
    })
  })

  it('Should return nothing if from and to are the same', () => {
    const days = {
      Monday: {
        from: '19:00',
        to: '19:00'
      }
    }

    const range = {
      from: '2018-12-12T17:00:00+00:00',
      to: '2018-12-25T01:00:00+00:00'
    }

    const availability: Interval[] = []

    timetableToSchedule(days, range, UTC_OPTIONS).should.eql({
      availability,
      unavailability: []
    })
  })

  it('Should return Intervals with multiple day schedule', () => {
    const days = {
      Monday: {
        from: '12:00',
        to: '17:00'
      },
      Tuesday: {
        from: '10:00',
        to: '19:00'
      },
      Wednesday: {
        from: '15:00',
        to: '16:00'
      },
      Thursday: {
        from: '11:30',
        to: '15:00'
      },
      Friday: {
        from: '13:25',
        to: '16:33'
      }
    }

    const range = {
      from: '2018-12-24T12:00:00+00:00',
      to: '2019-01-01T18:00:00+00:00'
    }

    const availability: Interval[] = [
      { from: '2018-12-24T12:00:00+00:00', to: '2018-12-24T17:00:00+00:00' },
      { from: '2018-12-25T10:00:00+00:00', to: '2018-12-25T19:00:00+00:00' },
      { from: '2018-12-26T15:00:00+00:00', to: '2018-12-26T16:00:00+00:00' },
      { from: '2018-12-27T11:30:00+00:00', to: '2018-12-27T15:00:00+00:00' },
      { from: '2018-12-28T13:25:00+00:00', to: '2018-12-28T16:33:00+00:00' },
      { from: '2018-12-31T12:00:00+00:00', to: '2018-12-31T17:00:00+00:00' },
      { from: '2019-01-01T10:00:00+00:00', to: '2019-01-01T18:00:00+00:00' }
    ]

    timetableToSchedule(days, range, UTC_OPTIONS).should.eql({
      availability,
      unavailability: []
    })
  })

  it('Should return only weekday schedule when given weekdays', () => {
    const days = {
      weekdays: {
        from: '12:00',
        to: '17:00'
      }
    }

    const range = {
      from: '2018-12-12T17:00:00+00:00',
      to: '2018-12-19T13:00:00+00:00'
    }

    const availability: Interval[] = [
      { from: '2018-12-13T12:00:00+00:00', to: '2018-12-13T17:00:00+00:00' },
      { from: '2018-12-14T12:00:00+00:00', to: '2018-12-14T17:00:00+00:00' },
      { from: '2018-12-17T12:00:00+00:00', to: '2018-12-17T17:00:00+00:00' },
      { from: '2018-12-18T12:00:00+00:00', to: '2018-12-18T17:00:00+00:00' },
      { from: '2018-12-19T12:00:00+00:00', to: '2018-12-19T13:00:00+00:00' }
    ]

    timetableToSchedule(days, range, UTC_OPTIONS).should.eql({
      availability,
      unavailability: []
    })
  })

  it('Should return unavailabilities between range for single day', () => {
    const days = {
      Monday: {
        from: '09:00',
        to: '17:00',
        unavailability: [
          {
            from: '12:00',
            to: '16:00'
          }
        ]
      }
    }

    const range = {
      from: '2018-12-13T00:00:00+00:00',
      to: '2018-12-25T00:00:00+00:00'
    }

    const availability = [
      { from: '2018-12-17T09:00:00+00:00', to: '2018-12-17T17:00:00+00:00' },
      { from: '2018-12-24T09:00:00+00:00', to: '2018-12-24T17:00:00+00:00' }
    ]

    const unavailability = [
      { from: '2018-12-17T12:00:00+00:00', to: '2018-12-17T16:00:00+00:00' },
      { from: '2018-12-24T12:00:00+00:00', to: '2018-12-24T16:00:00+00:00' }
    ]

    timetableToSchedule(days, range, UTC_OPTIONS).should.eql({
      availability,
      unavailability
    })
  })

  it('Should return unavailabilities between range for multiple days', () => {
    const days = {
      Monday: {
        from: '09:00',
        to: '17:00',
        unavailability: [
          {
            from: '12:00',
            to: '16:00'
          }
        ]
      },
      Tuesday: {
        from: '09:00',
        to: '17:00'
      },
      Wednesday: {
        from: '09:00',
        to: '17:00',
        unavailability: [
          {
            from: '12:00',
            to: '13:00'
          }
        ]
      }
    }

    const range = {
      from: '2018-12-13T00:00:00+00:00',
      to: '2018-12-24T13:00:00+00:00'
    }

    const availability = [
      { from: '2018-12-17T09:00:00+00:00', to: '2018-12-17T17:00:00+00:00' },
      { from: '2018-12-18T09:00:00+00:00', to: '2018-12-18T17:00:00+00:00' },
      { from: '2018-12-19T09:00:00+00:00', to: '2018-12-19T17:00:00+00:00' },
      { from: '2018-12-24T09:00:00+00:00', to: '2018-12-24T13:00:00+00:00' }
    ]

    const unavailability = [
      { from: '2018-12-17T12:00:00+00:00', to: '2018-12-17T16:00:00+00:00' },
      { from: '2018-12-19T12:00:00+00:00', to: '2018-12-19T13:00:00+00:00' },
      { from: '2018-12-24T12:00:00+00:00', to: '2018-12-24T13:00:00+00:00' }
    ]

    timetableToSchedule(days, range, UTC_OPTIONS).should.eql({
      availability,
      unavailability
    })
  })

  it('Should be equal when weekly and daily schedule are the same', () => {
    const days = {
      Monday: {
        from: '09:00',
        to: '17:00',
        unavailability: [
          {
            from: '12:00',
            to: '13:00'
          }
        ]
      },
      Tuesday: {
        from: '09:00',
        to: '17:00',
        unavailability: [
          {
            from: '12:00',
            to: '13:00'
          }
        ]
      },
      Wednesday: {
        from: '09:00',
        to: '17:00',
        unavailability: [
          {
            from: '12:00',
            to: '13:00'
          }
        ]
      },
      Thursday: {
        from: '09:00',
        to: '17:00',
        unavailability: [
          {
            from: '12:00',
            to: '13:00'
          }
        ]
      },
      Friday: {
        from: '09:00',
        to: '17:00',
        unavailability: [
          {
            from: '12:00',
            to: '13:00'
          }
        ]
      }
    }

    const weekdays = {
      weekdays: {
        from: '09:00',
        to: '17:00',
        unavailability: [
          {
            from: '12:00',
            to: '13:00'
          }
        ]
      }
    }

    const range = {
      from: '2018-12-24T09:00:00+00:00',
      to: '2018-12-29T00:00:00+00:00'
    }

    const daily = timetableToSchedule(days, range, UTC_OPTIONS)
    const weekly = timetableToSchedule(weekdays, range, UTC_OPTIONS)

    daily.should.eql(weekly)
  })

  it('Should return only unavailabilities if no availabilities are passed', () => {
    const days = {
      Monday: {
        unavailability: [
          {
            from: '12:00',
            to: '13:00'
          }
        ]
      }
    }

    const range = {
      from: '2018-12-13T00:00:00+00:00',
      to: '2018-12-25T00:00:00+00:00'
    }

    const availability: TimeInterval[] = []
    const unavailability = [
      { from: '2018-12-17T12:00:00+00:00', to: '2018-12-17T13:00:00+00:00' },
      { from: '2018-12-24T12:00:00+00:00', to: '2018-12-24T13:00:00+00:00' }
    ]

    timetableToSchedule(days, range, UTC_OPTIONS).should.eql({
      availability,
      unavailability
    })
  })
})
