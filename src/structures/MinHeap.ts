import { Heap } from '@/structures/Heap'
import type { Item, TItemDefaultComparator } from '@/structures/Item'

export default class MinHeap<TValue = unknown> extends Heap<TValue> {

  static name = 'MinHeap'

  constructor(readonly rawComparator?: TItemDefaultComparator) {
    super(rawComparator)
  }

  checkPairOrder(
    rawItemOne: Item<TValue> | null,
    rawItemTwo: Item<TValue> | null
  ): boolean {
    // For MaxHeap the first element must be always bigger or equal.
    return this._compare.isLessOrEqual(rawItemOne, rawItemTwo)
  }

}

function useMinHeap<TValue = unknown>(rawComparator?: TItemDefaultComparator): MinHeap<TValue> {
  return new MinHeap<TValue>(rawComparator)
}

export { MinHeap, useMinHeap }
