import { Queue, useQueue } from '@/structures/Queue'
import type { TItemDefaultValue } from '@/structures/Item'

const ITEM_ONE = 1
const ITEM_TWO = 2

describe(`${Queue.name}`, () => {

  it(`Should create proper instance of ${Queue.name}`, () => {
    const queue = useQueue<number>()
    let val: TItemDefaultValue<number> = queue.dequeueItem()

    expect(queue.isEmpty).toBeTruthy()
    expect(queue.peekValue).toBeNull()
    expect(val).toBeNull()

    // Add item
    queue.
      enqueueItem(ITEM_ONE).
      enqueueItem(ITEM_TWO)

    expect(queue.isEmpty).toBeFalsy()
    expect(queue.peekValue).toBe(ITEM_ONE)

    // Get item
    val = queue.dequeueItem()

    expect(val).toBe(ITEM_ONE)
    expect(queue.peekValue).toBe(ITEM_TWO)

    // Empty queue
    val = queue.dequeueItem()

    expect(val).toBe(ITEM_TWO)
    expect(queue.peekValue).toBeNull()
    expect(queue.isEmpty).toBeTruthy()
  })

})
