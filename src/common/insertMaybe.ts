export default <T>(obj: { [k: string]: T }) => {
  const key = Object.keys(obj).pop()
  return key && obj[key] !== undefined ? obj : {}
}
