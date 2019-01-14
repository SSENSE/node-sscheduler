import { Interval, substract } from '../../../src/interval'
import '../../pretest'

const intervalConfig = {
  format: {
    date: 'YYYY-MM-DDTHH:mm:ssZ',
    timezone: 'UTC'
  },
  timezone: 'UTC'
}

const boundSubstract = (a: Interval | Interval[], b: Interval | Interval[]) =>
  substract(a, b, intervalConfig)

const getReferences = (intervals: Interval[]) =>
  intervals.map(({ reference }) => reference)

describe('substract', () => {
  it('Should split an interval between one unavailability', () => {
    const interval = {
      from: '2018-12-14T12:00:00+00:00',
      to: '2018-12-14T19:00:00+00:00'
    }

    const unavailabilities = {
      from: '2018-12-14T13:00:00+00:00',
      to: '2018-12-14T14:00:00+00:00'
    }

    const expected = [
      {
        from: '2018-12-14T12:00:00+00:00',
        to: '2018-12-14T13:00:00+00:00'
      },
      {
        from: '2018-12-14T14:00:00+00:00',
        to: '2018-12-14T19:00:00+00:00'
      }
    ]

    boundSubstract(interval, unavailabilities).should.eql(expected)
  })

  it('Should split an interval between an array of one unavailability', () => {
    const interval = {
      from: '2018-12-14T12:00:00+00:00',
      to: '2018-12-14T19:00:00+00:00'
    }

    const unavailabilities = [
      {
        from: '2018-12-14T13:00:00+00:00',
        to: '2018-12-14T14:00:00+00:00'
      }
    ]

    const expected = [
      {
        from: '2018-12-14T12:00:00+00:00',
        to: '2018-12-14T13:00:00+00:00'
      },
      {
        from: '2018-12-14T14:00:00+00:00',
        to: '2018-12-14T19:00:00+00:00'
      }
    ]

    boundSubstract(interval, unavailabilities).should.eql(expected)
  })

  it('Should split an interval between several unavailabilities', () => {
    const interval = {
      from: '2018-12-14T12:00:00+00:00',
      to: '2018-12-14T19:00:00+00:00'
    }

    const unavailabilities = [
      {
        from: '2018-12-14T13:00:00+00:00',
        to: '2018-12-14T14:00:00+00:00'
      },
      {
        from: '2018-12-14T18:00:00+00:00',
        to: '2018-12-14T18:30:00+00:00'
      }
    ]

    const expected = [
      {
        from: '2018-12-14T12:00:00+00:00',
        to: '2018-12-14T13:00:00+00:00'
      },
      {
        from: '2018-12-14T14:00:00+00:00',
        to: '2018-12-14T18:00:00+00:00'
      },
      {
        from: '2018-12-14T18:30:00+00:00',
        to: '2018-12-14T19:00:00+00:00'
      }
    ]

    boundSubstract(interval, unavailabilities).should.eql(expected)
  })

  it('Should ignore unavailabilities outside of the interval', () => {
    const interval = {
      from: '2018-12-14T12:00:00+00:00',
      to: '2018-12-14T19:00:00+00:00'
    }

    const unavailabilities = [
      {
        from: '2018-12-13T13:00:00+00:00',
        to: '2018-12-13T14:00:00+00:00'
      },
      {
        from: '2018-12-13T18:00:00+00:00',
        to: '2018-12-13T18:30:00+00:00'
      }
    ]

    const expected = [
      {
        from: '2018-12-14T12:00:00+00:00',
        to: '2018-12-14T19:00:00+00:00'
      }
    ]

    boundSubstract(interval, unavailabilities).should.eql(expected)
  })

  it('Should concatenate overlapping unavailabilities', () => {
    const interval = {
      from: '2018-12-14T12:00:00+00:00',
      to: '2018-12-14T19:00:00+00:00'
    }

    const unavailabilities = [
      {
        from: '2018-12-14T13:00:00+00:00',
        to: '2018-12-14T14:00:00+00:00'
      },
      {
        from: '2018-12-14T18:00:00+00:00',
        to: '2018-12-14T18:30:00+00:00'
      },
      {
        from: '2018-12-14T13:25:00+00:00',
        to: '2018-12-14T17:30:00+00:00'
      }
    ]

    const expected = [
      {
        from: '2018-12-14T12:00:00+00:00',
        to: '2018-12-14T13:00:00+00:00'
      },
      {
        from: '2018-12-14T17:30:00+00:00',
        to: '2018-12-14T18:00:00+00:00'
      },
      {
        from: '2018-12-14T18:30:00+00:00',
        to: '2018-12-14T19:00:00+00:00'
      }
    ]

    boundSubstract(interval, unavailabilities).should.eql(expected)
  })

  it('Should start availabilities at end of unvailability, if unavailability start before availability', () => {
    const interval = {
      from: '2018-12-14T12:00:00+00:00',
      to: '2018-12-14T19:00:00+00:00'
    }

    const unavailabilities = [
      {
        from: '2018-12-14T10:00:00+00:00',
        to: '2018-12-14T13:00:00+00:00'
      }
    ]

    const expected = [
      {
        from: '2018-12-14T13:00:00+00:00',
        to: '2018-12-14T19:00:00+00:00'
      }
    ]

    boundSubstract(interval, unavailabilities).should.eql(expected)
  })

  it('Should end availabilities at end of unvailability, if unavailability ends after availability', () => {
    const interval = {
      from: '2018-12-14T12:00:00+00:00',
      to: '2018-12-14T19:00:00+00:00'
    }

    const unavailabilities = [
      {
        from: '2018-12-14T18:00:00+00:00',
        to: '2018-12-14T22:00:00+00:00'
      }
    ]

    const expected = [
      {
        from: '2018-12-14T12:00:00+00:00',
        to: '2018-12-14T18:00:00+00:00'
      }
    ]

    boundSubstract(interval, unavailabilities).should.eql(expected)
  })

  it('Should return no availabilities if one unvailability lasts the entire interval', () => {
    const interval = {
      from: '2018-12-14T12:00:00+00:00',
      to: '2018-12-14T19:00:00+00:00'
    }

    const unavailabilities = [
      {
        from: '2018-12-14T12:00:00+00:00',
        to: '2018-12-14T19:00:00+00:00'
      }
    ]

    const expected: any = []

    boundSubstract(interval, unavailabilities).should.eql(expected)
  })

  it('Should return no availabilities if the aggregate unvailabilities lasts the entire interval', () => {
    const interval = {
      from: '2018-12-14T12:00:00+00:00',
      to: '2018-12-14T19:00:00+00:00'
    }

    const unavailabilities = [
      {
        from: '2018-12-14T12:00:00+00:00',
        to: '2018-12-14T13:00:00+00:00'
      },
      {
        from: '2018-12-14T13:00:00+00:00',
        to: '2018-12-14T16:30:00+00:00'
      },
      {
        from: '2018-12-14T16:30:00+00:00',
        to: '2018-12-14T19:00:00+00:00'
      }
    ]

    const expected: any = []

    boundSubstract(interval, unavailabilities).should.eql(expected)
  })

  it('Should return no availabilities if the aggregate unvailabilities start before the availability and lasts the entire interval', () => {
    const interval = {
      from: '2018-12-14T12:00:00+00:00',
      to: '2018-12-14T19:00:00+00:00'
    }

    const unavailabilities = [
      {
        from: '2018-12-14T10:00:00+00:00',
        to: '2018-12-14T13:00:00+00:00'
      },
      {
        from: '2018-12-14T13:00:00+00:00',
        to: '2018-12-14T16:30:00+00:00'
      },
      {
        from: '2018-12-14T16:30:00+00:00',
        to: '2018-12-14T19:00:00+00:00'
      }
    ]

    const expected: any = []

    boundSubstract(interval, unavailabilities).should.eql(expected)
  })

  it('Should return no availabilities if the aggregate unvailabilities end after the availability and lasts the entire interval', () => {
    const interval = {
      from: '2018-12-14T12:00:00+00:00',
      to: '2018-12-14T19:00:00+00:00'
    }

    const unavailabilities = [
      {
        from: '2018-12-14T12:00:00+00:00',
        to: '2018-12-14T13:00:00+00:00'
      },
      {
        from: '2018-12-14T13:00:00+00:00',
        to: '2018-12-14T16:30:00+00:00'
      },
      {
        from: '2018-12-14T16:30:00+00:00',
        to: '2018-12-15T19:00:00+00:00'
      }
    ]

    const expected: any = []

    boundSubstract(interval, unavailabilities).should.eql(expected)
  })

  it('Should return no availabilities if the aggregate unvailabilities last the entire interval with overlapping unavailabilities', () => {
    const interval = {
      from: '2018-12-14T12:00:00+00:00',
      to: '2018-12-14T19:00:00+00:00'
    }

    const unavailabilities = [
      {
        from: '2018-12-14T10:00:00+00:00',
        to: '2018-12-14T13:00:00+00:00'
      },
      {
        from: '2018-12-14T11:00:00+00:00',
        to: '2018-12-14T16:30:00+00:00'
      },
      {
        from: '2018-12-14T16:30:00+00:00',
        to: '2018-12-14T19:00:00+00:00'
      }
    ]

    const expected: any = []

    boundSubstract(interval, unavailabilities).should.eql(expected)
  })

  it('Should split interval with unavailabilities in different time zones', () => {
    const interval = {
      from: '2018-12-14T12:00:00+00:00',
      to: '2018-12-14T19:00:00+00:00'
    }

    const unavailabilities = [
      {
        from: '2018-12-14T11:00:00-02:00',
        to: '2018-12-14T12:00:00-02:00'
      }
    ]

    const expected = [
      {
        from: '2018-12-14T12:00:00+00:00',
        to: '2018-12-14T13:00:00+00:00'
      },
      {
        from: '2018-12-14T14:00:00+00:00',
        to: '2018-12-14T19:00:00+00:00'
      }
    ]

    boundSubstract(interval, unavailabilities).should.eql(expected)
  })

  it('Should split interval with availabilities in different time zone than UTC ', () => {
    const interval = {
      from: '2018-12-13T18:00:00-18:00',
      to: '2018-12-14T01:00:00-18:00'
    }

    const unavailabilities = {
      from: '2018-12-14T11:00:00-02:00',
      to: '2018-12-14T12:00:00-02:00'
    }

    const expected = [
      {
        from: '2018-12-14T12:00:00+00:00',
        to: '2018-12-14T13:00:00+00:00'
      },
      {
        from: '2018-12-14T14:00:00+00:00',
        to: '2018-12-14T19:00:00+00:00'
      }
    ]

    boundSubstract(interval, unavailabilities).should.eql(expected)
  })

  it('Should boundSubstract one interval from many intervals', () => {
    const intervals = [
      {
        from: '2018-12-14T12:00:00+00:00',
        to: '2018-12-14T19:00:00+00:00'
      },
      {
        from: '2018-12-14T20:00:00+00:00',
        to: '2018-12-14T23:00:00+00:00'
      }
    ]

    const unavailabilities = {
      from: '2018-12-14T18:00:00+00:00',
      to: '2018-12-14T22:00:00+00:00'
    }

    const expected = [
      { from: '2018-12-14T12:00:00+00:00', to: '2018-12-14T18:00:00+00:00' },
      { from: '2018-12-14T22:00:00+00:00', to: '2018-12-14T23:00:00+00:00' }
    ]

    boundSubstract(intervals, unavailabilities).should.eql(expected)
  })

  it('Should boundSubstract many intervals from one interval', () => {
    const interval = {
      from: '2018-12-14T12:00:00+00:00',
      to: '2018-12-14T19:00:00+00:00'
    }

    const unavailabilities = [
      {
        from: '2018-12-14T18:00:00+00:00',
        to: '2018-12-14T22:00:00+00:00'
      },
      {
        from: '2018-12-14T13:00:00+00:00',
        to: '2018-12-14T15:00:00+00:00'
      }
    ]

    const expected = [
      { from: '2018-12-14T12:00:00+00:00', to: '2018-12-14T13:00:00+00:00' },
      { from: '2018-12-14T15:00:00+00:00', to: '2018-12-14T18:00:00+00:00' }
    ]

    boundSubstract(interval, unavailabilities).should.eql(expected)
  })

  it('Should always keep references for a single interval', () => {
    const interval = {
      from: '2018-12-14T12:00:00+00:00',
      reference: 'A',
      to: '2018-12-14T19:00:00+00:00'
    }

    const unavailabilities = [
      {
        from: '2018-12-14T13:00:00+00:00',
        to: '2018-12-14T14:00:00+00:00'
      }
    ]

    boundSubstract(interval, unavailabilities).should.each.have.property(
      'reference',
      interval.reference
    )
  })

  it('Should keep reference when substracting one interval from many intervals', () => {
    const intervals = [
      {
        from: '2018-12-14T12:00:00+00:00',
        reference: 'A',
        to: '2018-12-14T19:00:00+00:00'
      },
      {
        from: '2018-12-14T20:00:00+00:00',
        reference: 'B',
        to: '2018-12-14T23:00:00+00:00'
      }
    ]

    const unavailabilities = {
      from: '2018-12-14T18:00:00+00:00',
      reference: 'C',
      to: '2018-12-14T22:00:00+00:00'
    }

    const expected = getReferences(intervals)

    getReferences(boundSubstract(intervals, unavailabilities)).should.eql(
      expected
    )
  })

  it('Should keep references when substracting many intervals from one interval', () => {
    const interval = {
      from: '2018-12-14T12:00:00+00:00',
      reference: 'A',
      to: '2018-12-14T19:00:00+00:00'
    }

    const unavailabilities = [
      {
        from: '2018-12-14T18:00:00+00:00',
        reference: 'B',
        to: '2018-12-14T22:00:00+00:00'
      },
      {
        from: '2018-12-14T13:00:00+00:00',
        reference: 'C',
        to: '2018-12-14T15:00:00+00:00'
      }
    ]

    boundSubstract(interval, unavailabilities).should.each.have.property(
      'reference',
      interval.reference
    )
  })
})
