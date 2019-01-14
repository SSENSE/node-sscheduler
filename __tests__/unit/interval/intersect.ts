import { expect } from 'chai'
import { intersect, Interval } from '../../../src/interval'
import '../../pretest'

const intervalConfig = {
  format: {
    date: 'YYYY-MM-DDTHH:mm:ssZ',
    timezone: 'UTC'
  },
  timezone: 'UTC'
}

const boundIntersect = (a: any, b: any) => intersect(a, b, intervalConfig)

describe('intersect AB with CD', () => {
  it(`
given: A________B
           C_________D
should:    C____B
  `, () => {
    const A = {
      from: '2018-12-14T12:00:00+00:00'
    }
    const B = {
      to: '2018-12-14T16:00:00+00:00'
    }
    const C = {
      from: '2018-12-14T13:00:00+00:00'
    }
    const D = {
      to: '2018-12-14T19:00:00+00:00'
    }

    expect(boundIntersect({ ...A, ...B }, { ...C, ...D })).to.be.eql([
      {
        ...C,
        ...B
      }
    ])
  })

  it(`
given: A________B
    C_________D
should:A______D
    `, () => {
    const A = {
      from: '2018-12-14T12:00:00+00:00'
    }
    const B = {
      to: '2018-12-14T16:00:00+00:00'
    }
    const C = {
      from: '2018-12-14T10:00:00+00:00'
    }
    const D = {
      to: '2018-12-14T14:00:00+00:00'
    }

    expect(boundIntersect({ ...A, ...B }, { ...C, ...D })).to.be.eql([
      {
        ...A,
        ...D
      }
    ])
  })

  it(`
given: A________B
    C_____________D
should:A________B
    `, () => {
    const A = {
      from: '2018-12-14T12:00:00+00:00'
    }
    const B = {
      to: '2018-12-14T16:00:00+00:00'
    }
    const C = {
      from: '2018-12-14T10:00:00+00:00'
    }
    const D = {
      to: '2018-12-14T18:00:00+00:00'
    }

    expect(boundIntersect({ ...A, ...B }, { ...C, ...D })).to.be.eql([
      {
        ...A,
        ...B
      }
    ])
  })

  it(`
given: A________B
         C____D
should:  C____D
    `, () => {
    const A = {
      from: '2018-12-14T12:00:00+00:00'
    }
    const B = {
      to: '2018-12-14T16:00:00+00:00'
    }
    const C = {
      from: '2018-12-14T13:00:00+00:00'
    }
    const D = {
      to: '2018-12-14T15:00:00+00:00'
    }

    expect(boundIntersect({ ...A, ...B }, { ...C, ...D })).to.be.eql([
      {
        ...C,
        ...D
      }
    ])
  })

  it(`
  given: A________B
         C________D
  should:A________B
      `, () => {
    const A = {
      from: '2018-12-14T12:00:00+00:00'
    }
    const B = {
      to: '2018-12-14T16:00:00+00:00'
    }
    const C = {
      from: '2018-12-14T12:00:00+00:00'
    }
    const D = {
      to: '2018-12-14T16:00:00+00:00'
    }

    expect(boundIntersect({ ...A, ...B }, { ...C, ...D })).to.be.eql([
      {
        ...A,
        ...B
      }
    ])
  })

  it(`
  given: A________B
                  C________D
  should:
      `, () => {
    const A = {
      from: '2018-12-14T12:00:00+00:00'
    }
    const B = {
      to: '2018-12-14T16:00:00+00:00'
    }
    const C = {
      from: '2018-12-14T16:00:00+00:00'
    }
    const D = {
      to: '2018-12-14T18:00:00+00:00'
    }

    // tslint:disable-next-line:no-unused-expression
    expect(boundIntersect({ ...A, ...B }, { ...C, ...D })).to.be.empty
  })

  it(`
  given:          A________B
         C________D
  should:
      `, () => {
    const A = {
      from: '2018-12-14T12:00:00+00:00'
    }
    const B = {
      to: '2018-12-14T16:00:00+00:00'
    }
    const C = {
      from: '2018-12-14T10:00:00+00:00'
    }
    const D = {
      to: '2018-12-14T12:00:00+00:00'
    }

    // tslint:disable-next-line:no-unused-expression
    expect(boundIntersect({ ...A, ...B }, { ...C, ...D })).to.be.empty
  })

  it(`Keep the first reference of an intersection`, () => {
    const A = {
      from: '2018-12-14T12:00:00+00:00',
      reference: 'A',
      to: '2018-12-14T16:00:00+00:00'
    }
    const B = {
      from: '2018-12-14T10:00:00+00:00',
      reference: 'B',
      to: '2018-12-14T14:00:00+00:00'
    }
    const intersection = boundIntersect(A, B).pop() as Interval
    expect(intersection.reference).to.be.eql(A.reference)
  })

  it(`Keep the first reference of an intersection when they are equal`, () => {
    const A = {
      from: '2018-12-14T12:00:00+00:00',
      reference: 'A',
      to: '2018-12-14T16:00:00+00:00'
    }

    const B = {
      from: '2018-12-14T12:00:00+00:00',
      reference: 'B',
      to: '2018-12-14T16:00:00+00:00'
    }

    const intersection = boundIntersect(A, B).pop() as Interval
    expect(intersection.reference).to.be.eql(A.reference)
  })
})
