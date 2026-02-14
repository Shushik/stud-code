type TTimerId = ReturnType<typeof setTimeout> | ReturnType<typeof setInterval> | null
type TTimerCallback = (...args: unknown[]) => unknown
type TDebouncerResult = (...args: unknown[]) => TTimerId
type TThrottlerResult = (...args: unknown[]) => unknown

function setTimer(callback: TTimerCallback, timeout: number = 0): TTimerId {
  if (typeof callback !== 'function') {
    throw new Error('setTimer: No callback')
  }

  if (timeout === 0) {
    setImmediate(callback)

    return null
  }

  return setTimeout(callback, timeout)
}

function clearTimer(timerId: TTimerId): null {
  if (timerId) {
    clearTimeout(timerId)
  }

  return null
}

function resetTimer(timerId: TTimerId, callback: TTimerCallback, timeout: number = 0): TTimerId {
  clearTimer(timerId)

  return setTimer(callback, timeout)
}

function useLooper(
  callback: TTimerCallback,
  timeout: number = 0,
  repeats: number = Infinity
): TTimerId {
  let counter = repeats
  let timerId = setInterval(() => {
    callback()

    counter -= 1

    if (!counter) {
      clearTimer(timerId)
    }
  }, timeout)

  return timerId
}

function useDebouncer(callback: TTimerCallback, timeout: number = 0): TDebouncerResult {
  if (typeof callback !== 'function') {
    throw new Error('useDebouncer: No callback')
  }

  let timerId: TTimerId

  return (...args: unknown[]) => {
    timerId = resetTimer(timerId, () => callback(...args), timeout)

    return timerId
  }
}

function useThrottler(callback: TTimerCallback, timeout: number = 0): TThrottlerResult {
  if (typeof callback !== 'function') {
    throw new Error('useThrottler: No callback')
  }

  let isItNow = true

  return (...args: unknown[]) => {
    if (isItNow) {
      callback(...args)

      isItNow = false

      setTimer(() => (isItNow = true), timeout)
    }
  }
}

export {
  TTimerId,
  setTimer,
  clearTimer,
  resetTimer,
  useLooper,
  useDebouncer,
  useThrottler
}
