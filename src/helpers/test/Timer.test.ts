import { vi } from 'vitest'
import {
  setTimer,
  clearTimer,
  resetTimer,
  useLooper,
  useDebouncer,
  useThrottler
} from '@/helpers/Timer'

vi.useFakeTimers()

const timeout = 1000
const defaultCallback = () => { }

describe('Timer helpers', () => {

  it('Should run timer', () => {
    const callback = vi.fn(defaultCallback)
    const timerId = setTimer(callback, timeout)

    vi.advanceTimersByTime(timeout)

    expect(timerId).not.toBeNull()
    expect(callback).toHaveBeenCalled()
  })

  it('Should not run timer', () => {
    const callback = vi.fn(defaultCallback)
    let timerId = setTimer(callback, timeout)

    timerId = clearTimer(timerId)

    vi.advanceTimersByTime(timeout)

    expect(timerId).toBeNull()
    expect(callback).not.toHaveBeenCalled()
  })

  it('Should reset timer', () => {
    const callback1 = vi.fn(defaultCallback)
    const callback2 = vi.fn(defaultCallback)
    let timerId = setTimer(callback1, timeout)
    const firstId = timerId

    timerId = resetTimer(timerId, callback2, timeout)

    vi.advanceTimersByTime(timeout)

    expect(timerId).not.toBe(firstId)
    expect(callback2).toHaveBeenCalled()
  })

  it('Should run Looper', () => {
    let counter = 0
    const finish = 3
    const callback = vi.fn(() => counter += 1)
    const timerId = useLooper(callback, timeout, finish)

    vi.advanceTimersByTime(timeout * finish)

    expect(timerId).not.toBeNull()
    expect(counter).toBe(finish)
    expect(callback).toHaveBeenCalled()
  })

  it('Should not run Looper', () => {
    let counter = 0
    const finish = 3
    const callback = vi.fn(() => counter += 1)
    let timerId = useLooper(callback, timeout, finish)

    timerId = clearTimer(timerId)

    vi.advanceTimersByTime(timeout * finish)

    expect(timerId).toBeNull()
    expect(counter).not.toBe(finish)
    expect(callback).not.toHaveBeenCalled()
  })

  it('Should run debounced function once', () => {
    let counter = 0
    const called = 1
    const callback = vi.fn(() => counter += 1)
    const debounced = useDebouncer(callback, timeout)

    for (let it0 = 0; it0 < 5; it0++) {
      debounced()
    }

    vi.advanceTimersByTime(timeout)

    expect(counter).toBe(called)
    expect(callback).toHaveBeenCalledTimes(called)
  })

  it('Should run throttled function once', () => {
    let counter = 0
    const called = 1

    const callback = vi.fn(() => counter += 1)
    const throttled = useThrottler(callback, timeout)

    for (let it0 = 0; it0 < 5; it0++) {
      throttled()
    }

    vi.advanceTimersByTime(timeout)

    expect(counter).toBe(called)
    expect(callback).toHaveBeenCalledTimes(called)
  })

})
