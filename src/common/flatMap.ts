import flatten from './flatten'

export default <T extends any, R extends any>(
  fn: (item: T) => R[],
  xs: T[]
): R[] => flatten(xs.map(fn))
