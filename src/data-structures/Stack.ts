import type {
  TItemDefaultValue,
  TItemDefaultComparator,
  TItemDefaultStringifier
} from '@/data-structures/Item'
import { type LinkedList, useLinkedList } from '@/data-structures/LinkedList'
import type { LinkedListItem } from '@/data-structures/LinkedListItem'

export default class Stack<TValue = unknown> {

  static name = 'Stack'

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

  popItem(): TItemDefaultValue<TValue> {
    if (this.isEmpty) {
      return null
    }

    const item = this._itemsList.deleteHead()

    return item ? item.value : null
  }

  pushItem(rawNewItem: LinkedListItem<TValue> | TValue): Stack<TValue> {
    this._itemsList.prependItem(rawNewItem)

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

function useStack<TValue = unknown>(
  rawComparator?: TItemDefaultComparator
): Stack<TValue> {
  return new Stack<TValue>(rawComparator)
}

export { Stack, useStack }
