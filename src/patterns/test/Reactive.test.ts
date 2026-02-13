import { vi } from 'vitest'
import {useReactive, useWatch} from '@/patterns/Reactive'

interface IValue {
  a: string,
  b: string,
  c: number | string
}

const PRIMITIVE_VALUE = 1
const OBJECT_VALUE: IValue = {
  a: 'a',
  b: 'b',
  c: 'c'
}
const OBJECT_CHANGE_KEY = 'c'

describe('useReactive', () => {

  it('Should create primitive reactive variable', () => {
    const num = useReactive<number>(PRIMITIVE_VALUE)

    expect(num.value).toBe(PRIMITIVE_VALUE)

    num.value += PRIMITIVE_VALUE

    expect(num.value).toBe(PRIMITIVE_VALUE + PRIMITIVE_VALUE)
  })

  it('Should create object reactive variable', () => {
    const obj = useReactive<IValue>(Object.assign({ }, OBJECT_VALUE))

    expect(obj.value).toEqual(OBJECT_VALUE)

    obj.value[OBJECT_CHANGE_KEY] = PRIMITIVE_VALUE

    expect(obj.value[OBJECT_CHANGE_KEY]).toEqual(PRIMITIVE_VALUE)
  })

  it('Should react on primitive change', () => {
    const num = useReactive<number>(PRIMITIVE_VALUE)
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

    // Change internal object property
    obj.value[OBJECT_CHANGE_KEY] = PRIMITIVE_VALUE

    expect(listener1).toHaveBeenCalledTimes(1)
    expect(listener1).toHaveBeenCalledWith(PRIMITIVE_VALUE, OBJECT_CHANGE_KEY)
    expect(listener2).toHaveBeenCalledTimes(1)
    expect(listener2).toHaveBeenCalledWith(PRIMITIVE_VALUE, OBJECT_CHANGE_KEY)
    expect(listener3).toHaveBeenCalledTimes(1)
    expect(listener3).toHaveBeenCalledWith(OBJECT_VALUE, OBJECT_VALUE)
  })

})
