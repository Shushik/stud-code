import { vi } from 'vitest'
import {
  useRef,
  useWatch,
  useUnwatch,
  useComputed,
  useReactive
} from '@/patterns/Reactive'

interface IValue {
  a: string,
  b: string,
  c: number | string
  d?: number
}

const PRIMITIVE_VALUE = 1
const OBJECT_ADD_KEY = 'd'
const OBJECT_CHANGE_KEY = 'c'
const OBJECT_VALUE: IValue = {
  a: 'a',
  b: 'b',
  c: 'c'
}

describe('useRef', () => {

  it('Should create primitive reactive variable', () => {
    const num = useRef<number>(PRIMITIVE_VALUE)

    expect(num.value).toBe(PRIMITIVE_VALUE)

    num.value += PRIMITIVE_VALUE

    expect(num.value).toBe(PRIMITIVE_VALUE + PRIMITIVE_VALUE)
  })

  it('Should create computed wrap over primitive reactive variable', () => {
    const num = useRef<number>(PRIMITIVE_VALUE)
    const checkNum1 = 2
    const checkNum2 = 3
    const computedNum1 = useComputed(() => PRIMITIVE_VALUE + PRIMITIVE_VALUE)
    const computedNum2 = useComputed<number>(() => num.value + PRIMITIVE_VALUE)
    const listener1 = vi.fn((_newVal, _oldVal) => { })
    const listener2 = vi.fn((_newVal, _oldVal) => { })

    useWatch(() => computedNum2.value, listener1)
    useWatch(() => computedNum2.value, listener2)

    num.value += PRIMITIVE_VALUE * PRIMITIVE_VALUE

    expect(computedNum1.value).toBe(checkNum1)
    expect(computedNum2.value).toBe(checkNum2)
    expect(listener1).toHaveBeenCalledTimes(1)
    expect(listener1).toHaveBeenCalledWith(checkNum2, checkNum1)
    expect(listener2).toHaveBeenCalledTimes(1)
    expect(listener2).toHaveBeenCalledWith(checkNum2, checkNum1)
  })

  it('Should create computed wrap over object reactive variable', () => {
    const obj = useReactive<IValue>(Object.assign({ }, OBJECT_VALUE))
    const checkVal1 = OBJECT_VALUE[OBJECT_CHANGE_KEY]
    const checkVal2 = `${PRIMITIVE_VALUE}`
    const computedObj = useComputed<string>(() => `${obj.value.c}`)
    const listener1 = vi.fn((_newVal, _oldVal) => { })
    const listener2 = vi.fn((_newVal, _oldVal) => { })

    useWatch(() => computedObj.value, listener1)
    useWatch(() => computedObj.value, listener2)

    expect(obj.value).toEqual(OBJECT_VALUE)

    obj.value[OBJECT_CHANGE_KEY] = PRIMITIVE_VALUE

    expect(computedObj.value).toEqual(checkVal2)
    expect(listener1).toHaveBeenCalledTimes(1)
    expect(listener1).toHaveBeenCalledWith(checkVal2, checkVal1)
    expect(listener2).toHaveBeenCalledTimes(1)
    expect(listener2).toHaveBeenCalledWith(checkVal2, checkVal1)
  })

  it('Should create object reactive variable', () => {
    const obj = useReactive<IValue>(Object.assign({ }, OBJECT_VALUE))

    expect(obj.value).toEqual(OBJECT_VALUE)

    obj.value[OBJECT_CHANGE_KEY] = PRIMITIVE_VALUE

    expect(obj.value[OBJECT_CHANGE_KEY]).toEqual(PRIMITIVE_VALUE)
  })

  it('Should react on primitive change', () => {
    const num = useRef<number>(PRIMITIVE_VALUE)
    const listener1 = vi.fn((_oldVal, _newVal) => { })
    const listener2 = vi.fn((_oldVal, _newVal) => { })

    useWatch(() => num.value, listener1)
    useWatch(() => num.value, listener2)

    num.value += PRIMITIVE_VALUE

    expect(listener1).toHaveBeenCalledTimes(1)
    expect(listener1).toHaveBeenCalledWith(PRIMITIVE_VALUE + PRIMITIVE_VALUE, PRIMITIVE_VALUE)
    expect(listener2).toHaveBeenCalledTimes(1)
    expect(listener2).toHaveBeenCalledWith(PRIMITIVE_VALUE + PRIMITIVE_VALUE, PRIMITIVE_VALUE)
  })

  it('Should react on object change', () => {
    const obj = useReactive<IValue>(OBJECT_VALUE)
    const listener1 = vi.fn((_newVal, _oldVal) => { })
    const listener2 = vi.fn((_newVal, _oldVal) => { })
    const listener3 = vi.fn((_newVal, _oldVal) => { })

    expect(obj.value).toEqual(OBJECT_VALUE)
    expect(obj.value).toEqual(OBJECT_VALUE)

    // Changing of internal object property should
    // trigger root listener too because it has been
    // changed too
    useWatch(() => obj.value[OBJECT_CHANGE_KEY], listener1)
    useWatch(() => obj.value[OBJECT_CHANGE_KEY], listener2)
    useWatch(() => obj.value, listener3)

    // Change existing internal object property
    obj.value[OBJECT_CHANGE_KEY] = PRIMITIVE_VALUE

    // Add new internal object property
    obj.value[OBJECT_ADD_KEY] = PRIMITIVE_VALUE

    // Delete last added object property
    delete obj.value[OBJECT_ADD_KEY]
    // Delete pre-last object property with watcher
    // @ts-ignore
    delete obj.value[OBJECT_CHANGE_KEY]

    // Return back pre-last object property without watcher
    // which should not affect call removed watcher
    obj.value[OBJECT_CHANGE_KEY] = PRIMITIVE_VALUE

    expect(listener1).toHaveBeenCalledTimes(2)
    expect(listener1).toHaveBeenCalledWith(PRIMITIVE_VALUE, OBJECT_CHANGE_KEY)
    expect(listener2).toHaveBeenCalledTimes(2)
    expect(listener2).toHaveBeenCalledWith(PRIMITIVE_VALUE, OBJECT_CHANGE_KEY)
    expect(listener3).toHaveBeenCalledTimes(5)
    expect(listener3).toHaveBeenCalledWith(OBJECT_VALUE, OBJECT_VALUE)
  })

  it('Should remove oncahge subscription', () => {
    const obj = useReactive<IValue>(OBJECT_VALUE)
    const listener1 = vi.fn((_newVal, _oldVal) => { })
    const listener2 = vi.fn(() => obj.value[OBJECT_CHANGE_KEY] + '1')
    const watcher = useWatch(() => obj.value[OBJECT_CHANGE_KEY], listener1)

    useComputed(listener2)
    useUnwatch(watcher)

    obj.value[OBJECT_CHANGE_KEY] = PRIMITIVE_VALUE
    obj.value[OBJECT_CHANGE_KEY] = PRIMITIVE_VALUE + PRIMITIVE_VALUE

    // One listener from useWatch should be removed,
    // And another one from useComputed should stay
    expect(listener1).not.toHaveBeenCalled()
    expect(listener2).toHaveBeenCalledTimes(2)
  })

})
