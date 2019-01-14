export interface Allocation {
  from: string
  duration: number // in minutes
}

export interface Allocated {
  allocated: Allocation[]
}

export { default as toInterval } from './toInterval'
