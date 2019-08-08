import flatten from '../common/flatten'
import insertMaybe from '../common/insertMaybe'
import toMoment from './toMoment'
import { Interval, MomentInterval } from './types'

interface UnixInterval {
  from: number
  to: number
  reference?: string
}

// converting to UnixInterval for performance improvement
const toSortedUnixInterval = (a: MomentInterval[]): UnixInterval[] =>
  a
    .map(({ from, to, reference }) => ({
      from: +from,
      ...insertMaybe({ reference }),
      to: +to
    }))
    .sort((a, b) => a.from - b.from)

const intersectMany = (
  a: MomentInterval[],
  b: MomentInterval[]
): MomentInterval[] => {
  // double pointer O(nlog(n)) solution
  const [sortedA, sortedB] = [toSortedUnixInterval(a), toSortedUnixInterval(b)]

  const result: UnixInterval[] = []
  let i = 0
  let j = 0

  while (i < sortedA.length && j < sortedB.length) {
    const intersection = intersectUnixInterval(sortedA[i], sortedB[j])
    if (intersection) result.push(intersection)

    sortedA[i].to <= sortedB[j].from ? i++ : j++
  }

  return result.map(interval => toMoment((interval as any) as Interval))
}

const intersectUnixInterval = (
  a: UnixInterval,
  b: UnixInterval
): UnixInterval | null => {
  const res = {
    from: Math.max(a.from, b.from),
    ...insertMaybe({
      reference: a.reference !== undefined ? a.reference : b.reference
    }),
    to: Math.min(a.to, b.to)
  }

  return res.from < res.to ? res : null
}

export default (
  a: MomentInterval[] | MomentInterval,
  b: MomentInterval[] | MomentInterval
): MomentInterval[] => intersectMany(flatten([a]), flatten([b]))
