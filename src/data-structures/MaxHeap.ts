import { Heap } from '@/data-structures/Heap'
import type { Item, TItemDefaultComparator } from '@/data-structures/Item'

export default class MaxHeap<TValue = unknown> extends Heap<TValue> {

  static name = 'MaxHeap'

  constructor(readonly rawComparator?: TItemDefaultComparator) {
    super(rawComparator)
  }

  checkPairOrder(
    rawItemOne: Item<TValue> | null,
    rawItemTwo: Item<TValue> | null
  ): boolean {
    // For MaxHeap the first element must be always bigger or equal.
    return this._compare.isGreaterOrEqual(rawItemOne, rawItemTwo)
  }

}

function useMaxHeap<TValue = unknown>(rawComparator?: TItemDefaultComparator): MaxHeap<TValue> {
  return new MaxHeap<TValue>(rawComparator)
}

export { MaxHeap, useMaxHeap }
