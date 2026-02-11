import { vi } from 'vitest'
import { Publisher, usePublisher } from '@/patterns/Publisher'

interface IData {
  a: string,
  b: string,
  c: string
}

const DEFAULT_EVENT = 'updated'
const DEFAULT_DATA: IData = {
  a: 'a',
  b: 'b',
  c: 'c'
}

const defaultCallback = (event) => event.detail

describe(`${Publisher.name}`, () => {

  it(`Should create proper instance of ${Publisher.name}`, () => {
    const callback = vi.fn(defaultCallback)
    const publisher = usePublisher<IData>()

    // Create subscription emit event
    publisher.on(DEFAULT_EVENT, callback)
    publisher.emit(DEFAULT_EVENT, DEFAULT_DATA)

    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveReturnedWith(DEFAULT_DATA)

    // Delete subscription emit event
    publisher.off(DEFAULT_EVENT, callback)
    publisher.emit(DEFAULT_EVENT, DEFAULT_DATA)

    expect(callback).toHaveBeenCalledTimes(1)
  })

})
