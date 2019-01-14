import { Interval, limitByRange } from '../../../src/interval'
import '../../pretest'

const intervalConfig = {
  format: {
    date: 'YYYY-MM-DDTHH:mm:ssZ',
    timezone: 'UTC'
  },
  timezone: 'UTC'
}

const boundLimitByRange = (a: any, b: any) => limitByRange(a, b, intervalConfig)

describe('limitByRange', () => {
  it('Should return all availabilities if availabilities are between the range', () => {
    const schedule = {
      availability: [
        {
          from: '2018-12-14T12:00:00+00:00',
          to: '2018-12-14T13:00:00+00:00'
        },
        {
          from: '2018-12-14T14:00:00+00:00',
          to: '2018-12-14T19:00:00+00:00'
        }
      ],
      unavailability: []
    }

    const range = {
      from: '2018-12-13T00:00:00+00:00',
      to: '2018-12-25T00:00:00+00:00'
    }

    boundLimitByRange(schedule.availability, range).should.eql(
      schedule.availability
    )
  })

  it('Should return no availabilities if availabilities are outside range', () => {
    const schedule = {
      availability: [
        {
          from: '2018-12-14T12:00:00+00:00',
          to: '2018-12-14T13:00:00+00:00'
        },
        {
          from: '2018-12-14T14:00:00+00:00',
          to: '2018-12-14T19:00:00+00:00'
        }
      ],
      unavailability: []
    }

    const range = {
      from: '2018-12-15T00:00:00+00:00',
      to: '2018-12-15T00:00:00+00:00'
    }

    const expected: Interval[] = []

    boundLimitByRange(schedule.availability, range).should.eql(expected)
  })

  it('Should return nothing if availabilities are outside range with range ending when availabilities start', () => {
    const schedule = {
      availability: [
        {
          from: '2018-12-14T12:00:00+00:00',
          to: '2018-12-14T13:00:00+00:00'
        },
        {
          from: '2018-12-14T14:00:00+00:00',
          to: '2018-12-14T19:00:00+00:00'
        }
      ],
      unavailability: []
    }

    const range = {
      from: '2018-12-13T00:00:00+00:00',
      to: '2018-12-14T12:00:00+00:00'
    }

    const expected: Interval[] = []

    boundLimitByRange(schedule.availability, range).should.eql(expected)
  })

  it('Should return nothing if availabilities are outside range with range starting when availabilities end', () => {
    const schedule = {
      availability: [
        {
          from: '2018-12-14T12:00:00+00:00',
          to: '2018-12-14T13:00:00+00:00'
        },
        {
          from: '2018-12-14T14:00:00+00:00',
          to: '2018-12-14T19:00:00+00:00'
        }
      ],
      unavailability: []
    }

    const range = {
      from: '2018-12-14T19:00:00+00:00',
      to: '2018-12-15T12:00:00+00:00'
    }

    const expected: Interval[] = []

    boundLimitByRange(schedule.availability, range).should.eql(expected)
  })

  it('Should limit end of availability when the end of the range falls between an availability', () => {
    const schedule = {
      availability: [
        {
          from: '2018-12-14T12:00:00+00:00',
          to: '2018-12-14T13:00:00+00:00'
        },
        {
          from: '2018-12-14T14:00:00+00:00',
          to: '2018-12-14T19:00:00+00:00'
        }
      ],
      unavailability: []
    }

    const range = {
      from: '2018-12-13T17:00:00+00:00',
      to: '2018-12-14T17:00:00+00:00'
    }

    const expected: Interval[] = [
      {
        from: '2018-12-14T12:00:00+00:00',
        to: '2018-12-14T13:00:00+00:00'
      },
      {
        from: '2018-12-14T14:00:00+00:00',
        to: '2018-12-14T17:00:00+00:00'
      }
    ]

    boundLimitByRange(schedule.availability, range).should.eql(expected)
  })

  it('Should limit start of availability when the start of the range falls between an availability', () => {
    const schedule = {
      availability: [
        {
          from: '2018-12-14T12:00:00+00:00',
          to: '2018-12-14T13:00:00+00:00'
        },
        {
          from: '2018-12-14T14:00:00+00:00',
          to: '2018-12-14T19:00:00+00:00'
        }
      ],
      unavailability: []
    }

    const range = {
      from: '2018-12-14T12:30:00+00:00',
      to: '2018-12-15T17:00:00+00:00'
    }

    const expected: Interval[] = [
      {
        from: '2018-12-14T12:30:00+00:00',
        to: '2018-12-14T13:00:00+00:00'
      },
      {
        from: '2018-12-14T14:00:00+00:00',
        to: '2018-12-14T19:00:00+00:00'
      }
    ]

    boundLimitByRange(schedule.availability, range).should.eql(expected)
  })

  it('Should not return an availability when the availability ends at the start of the range', () => {
    const schedule = {
      availability: [
        {
          from: '2018-12-14T12:00:00+00:00',
          to: '2018-12-14T13:00:00+00:00'
        },
        {
          from: '2018-12-14T14:00:00+00:00',
          to: '2018-12-14T19:00:00+00:00'
        }
      ],
      unavailability: []
    }

    const range = {
      from: '2018-12-14T13:00:00+00:00',
      to: '2018-12-15T17:00:00+00:00'
    }

    const expected: Interval[] = [
      {
        from: '2018-12-14T14:00:00+00:00',
        to: '2018-12-14T19:00:00+00:00'
      }
    ]

    boundLimitByRange(schedule.availability, range).should.eql(expected)
  })

  it('Should not return an availability when the availability starts at the end of the range', () => {
    const schedule = {
      availability: [
        {
          from: '2018-12-14T12:00:00+00:00',
          to: '2018-12-14T13:00:00+00:00'
        },
        {
          from: '2018-12-14T14:00:00+00:00',
          to: '2018-12-14T19:00:00+00:00'
        }
      ],
      unavailability: []
    }

    const range = {
      from: '2018-12-12T13:00:00+00:00',
      to: '2018-12-14T14:00:00+00:00'
    }

    const expected: Interval[] = [
      {
        from: '2018-12-14T12:00:00+00:00',
        to: '2018-12-14T13:00:00+00:00'
      }
    ]

    boundLimitByRange(schedule.availability, range).should.eql(expected)
  })

  it('Should keep all references', () => {
    const schedule = {
      availability: [
        {
          from: '2018-12-14T12:00:00+00:00',
          reference: 'A',
          to: '2018-12-14T13:00:00+00:00'
        },
        {
          from: '2018-12-14T14:00:00+00:00',
          reference: 'B',
          to: '2018-12-14T19:00:00+00:00'
        }
      ],
      unavailability: []
    }

    const range = {
      from: '2018-12-13T00:00:00+00:00',
      to: '2018-12-25T00:00:00+00:00'
    }

    const intervals = boundLimitByRange(schedule.availability, range)

    intervals.forEach((interval, index) =>
      (interval.reference as string).should.eql(
        schedule.availability[index].reference
      )
    )
  })
})
