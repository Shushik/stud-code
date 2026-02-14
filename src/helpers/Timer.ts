type TTimerId = ReturnType<typeof setTimeout> | ReturnType<typeof setInterval> | null
type TTimerCallback = (...args: unknown[]) => unknown
type TDebouncerResult = (...args: unknown[]) => TTimerId
type TThrottlerResult = (...args: unknown[]) => unknown

/**
 * Sets timeout and returns TimerId (number or null). If the second
 * argument isn't specified, runs setImmediate call and returns
 * null (because handler runs immediate, and it's hardly possible
 * to stop it)
 *
 * @function setTimer
 * @param callback
 * @param {number?} timeoutMS
 * @returns {number|null} TimerId
 */
function setTimer(callback: TTimerCallback, timeoutMS: number = 0): TTimerId {
  if (typeof callback !== 'function') {
    throw new Error('setTimer: No callback')
  }

  if (timeoutMS === 0) {
    setImmediate(callback)

    return null
  }

  return setTimeout(callback, timeoutMS)
}

/**
 * Clears existing timer and returns null as new TimerId
 * (which fixes clearTimeout behavior, which returns nothing)
 *
 * @function clearTimer
 * @param {number|null} timerId
 * @returns {null} TimerId
 */
function clearTimer(timerId: TTimerId): null {
  if (timerId) {
    clearTimeout(timerId)
  }

  return null
}

/**
 * Resets existing timer with a new handler
 *
 * @function resetTimer
 * @param {number|null} timerId
 * @param {Function} callback
 * @param {number?} timeoutMS
 * @returns {number|null} TimerId
 */
function resetTimer(timerId: TTimerId, callback: TTimerCallback, timeoutMS: number = 0): TTimerId {
  clearTimer(timerId)

  return setTimer(callback, timeoutMS)
}

/**
 * Runs given handler in a loop for a given number of times,
 * or infinitely if the third argument isn't specified
 *
 * @function useLooper
 * @param {Function} callback
 * @param {number?} timeoutMS
 * @param {number?} repeats
 * @returns {number|null} TimerId
 */
function useLooper(
  callback: TTimerCallback,
  timeoutMS: number = 0,
  repeats: number = Infinity
): TTimerId {
  let counter = repeats
  let timerId = setInterval(() => {
    callback()

    counter -= 1

    if (!counter) {
      clearTimer(timerId)
    }
  }, timeoutMS)

  return timerId
}

/**
 * To debounce means that given function will run in a given
 * time after it has been last called
 *
 * @function useDebouncer
 * @param {Function} callback
 * @param {number?} timeoutMS
 * @returns {Function}
 */
function useDebouncer(callback: TTimerCallback, timeoutMS: number = 0): TDebouncerResult {
  if (typeof callback !== 'function') {
    throw new Error('useDebouncer: No callback')
  }

  let timerId: TTimerId

  return (...args: unknown[]) => {
    timerId = resetTimer(timerId, () => callback(...args), timeoutMS)

    return timerId
  }
}

/**
 * To throttle means that given function will run no more often
 * than once in a given time even if it will be called oftener
 *
 * @function useThrottler
 * @param {Function} callback
 * @param {number?} timeoutMS
 * @returns {Function}
 */
function useThrottler(callback: TTimerCallback, timeoutMS: number = 0): TThrottlerResult {
  if (typeof callback !== 'function') {
    throw new Error('useThrottler: No callback')
  }

  let isItNow = true

  return (...args: unknown[]) => {
    if (isItNow) {
      callback(...args)

      isItNow = false

      setTimer(() => (isItNow = true), timeoutMS)
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
