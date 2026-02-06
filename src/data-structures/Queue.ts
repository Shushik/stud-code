import type {
  TItemDefaultValue,
  TItemDefaultStringifier,
  TItemDefaultComparator
} from '@/data-structures/Item'
import { type LinkedList, useLinkedList } from '@/data-structures/LinkedList'
import type { LinkedListItem } from '@/data-structures/LinkedListItem'

export default class Queue<TValue = unknown> {

  static name = 'Queue'

  protected _itemsList: LinkedList<TValue>

  constructor(readonly rawComparator?: TItemDefaultComparator) {
    this._itemsList = useLinkedList<TValue>(rawComparator)
  }

  get isEmpty(): boolean {
    return !this._itemsList.headItem
  }

  get peekValue(): TItemDefaultValue<TValue> {
    if (this.isEmpty) {
      return null
    }

    return this._itemsList.headItem ?
      this._itemsList.headItem.value :
      null
  }

  dequeueItem(): TItemDefaultValue<TValue> {
    if (this.isEmpty) {
      return null
    }

    const item = this._itemsList.deleteHead()

    return item ? item.value : null
  }

  enqueueItem(rawNewItem: LinkedListItem<TValue> | TItemDefaultValue<TValue>): Queue<TValue> {
    this._itemsList.appendItem(rawNewItem)

    return this
  }

  valueOf(): TItemDefaultValue<TValue>[] {
    if (this.isEmpty) {
      return [ ]
    }

    return this._itemsList.valueOf()
  }

  toArray(): LinkedListItem<TValue>[] {
    if (this.isEmpty) {
      return [ ]
    }

    return this._itemsList.toArray()
  }

  toString(stringifier?: TItemDefaultStringifier<TValue>): string {
    if (this.isEmpty) {
      return ''
    }

    return this._itemsList.toString(stringifier)
  }

}

function useQueue<TValue = unknown>(
  rawComparator?: TItemDefaultComparator
): Queue<TValue> {
  return new Queue<TValue>(rawComparator)
}

export { Queue, useQueue }
