import flatten from '../common/flatten'
import insertMaybe from '../common/insertMaybe'
import { Nullable } from '../types'
import hasIntersection from './hasIntersection'
import isBetween from './isBetween'
import isGreaterOrEqual from './isGreaterOrEqual'
import sort from './sort'
import { MomentInterval } from './types'

const substractManyFromMany = (
  a: Nullable<MomentInterval[]>,
  b: Nullable<MomentInterval[]>
): MomentInterval[] => {
  if (!a || !b) return a || []
  const [sortedA, sortedB] = [sort(a), sort(b)]
  const result: MomentInterval[] = []

  let i = 0
  let j = 0

  for (const [index, next] of sortedA.entries()) {
    while (i < sortedB.length && sortedB[i].to.isBefore(next.from)) i++
    while (j < sortedB.length && sortedB[j].from.isBefore(next.to)) j++

    if (i >= sortedB.length) return result.concat(sortedA.slice(index))

    result.push(...substractManyFromOne(next, sortedB.slice(i, j + 1)))
  }

  return result
}

const substractManyFromOne = (
  a: MomentInterval,
  b: MomentInterval[]
): MomentInterval[] =>
  b.reduce(
    (availabilities, unavailability) => [
      ...availabilities.slice(0, -1),
      ...substractOneFromOne(availabilities.pop(), unavailability)
    ],
    [a]
  )

/**
 * substract(a, b) = result
 * CASE NO INTERSECTION:
 *
 *  a:        A_______B
 *  b:  C__D
 *  result:   A_______B
 *
 *  a:        A_______B
 *  b:                  C__D
 *  result:   A_______B
 *
 * **************************
 *
 * CASE b >= a
 *
 *  a:        A_______B
 *  b:        C_______D
 *  result:
 *
 *  a:        A_______B
 *  b:       C__________D
 *  result:
 *
 * **************************
 *  CASE BETWEEN:
 *
 *  a:      A_______B
 *  b:        C__D
 *  result: A_C  D__B
 *
 * ****************************
 *  OR ELSE:
 *
 *  a:       A_______B
 *  b:     C___D
 *  result:    D_____B
 *
 *  a:       A_______B
 *  b:             C___D
 *  result:  A_____C
 *
 */
const substractOneFromOne = (
  a: Nullable<MomentInterval>,
  b: Nullable<MomentInterval>
): MomentInterval[] =>
  (() => {
    const bBetweenA = isBetween(a, b, true)
    const negativeResult = bBetweenA && isGreaterOrEqual(b, a)

    if (!a || negativeResult) {
      return []
    }

    if (!b || !hasIntersection(a, b)) {
      return [a]
    }

    if (bBetweenA) {
      return [
        {
          from: a.from,
          ...insertMaybe({ reference: a.reference }),
          to: b.from
        },
        {
          from: b.to,
          ...insertMaybe({ reference: a.reference }),
          to: a.to
        }
      ]
    }

    return [
      {
        from: a.from.isBefore(b.from) ? a.from : b.to,
        ...insertMaybe({ reference: a.reference }),
        to: a.to.isAfter(b.to) // prettier-ignore
          ? a.to
          : b.from
      }
    ]
  })().filter(interval => interval.from.isBefore(interval.to))

export default (
  a: Nullable<MomentInterval> | Nullable<MomentInterval[]>,
  b: Nullable<MomentInterval> | Nullable<MomentInterval[]>
): MomentInterval[] =>
  substractManyFromMany(a && flatten([a]), b && flatten([b]))
