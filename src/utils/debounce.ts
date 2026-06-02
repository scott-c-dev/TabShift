export function debounce<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delayMs: number,
) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined

  return (...args: Args) => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      timeoutId = undefined
      callback(...args)
    }, delayMs)
  }
}
