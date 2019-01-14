type flatten = <T extends any[]>(
  xs: T
) => T extends Array<infer U> ? (U extends Array<infer V> ? V[] : U[]) : never

export default ((xs: any[]) => ([] as any).concat(...xs)) as flatten
