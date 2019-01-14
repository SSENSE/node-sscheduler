import isBetween from './isBetween'
import { MomentInterval } from './types'

/**
 * case CD isBetween AB:
 *      A______B
 *       C___D
 * ****************
 * case A isBetween CD or equal to C
 *      A______B
 *    C___D
 * ****************
 * case B is between CD or equal to D
 *      A______B
 *           C___D
 * ****************
 * case they are equal
 *      A______B
 *      C______D
 * ****************
 * else:
 *  false
 */
export default (a: MomentInterval, b: MomentInterval) =>
  isBetween(a, b) ||
  a.from.isBetween(b.from, b.to, 'minutes', '[)') ||
  a.to.isBetween(b.from, b.to, 'minutes', '(]')
