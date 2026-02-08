import { type TItemDefaultValue, Item } from '@/structures/Item'

export default class LinkedListItem<TValue = unknown> extends Item<TValue> {

  static name = 'LinkedListItem'

  _nextItem: LinkedListItem<TValue> | null

  constructor(
    readonly rawValue: TItemDefaultValue<TValue>,
    readonly rawNextItem: LinkedListItem<TValue> | null = null
  ) {
    super(rawValue)

    this._nextItem = rawNextItem
  }

  get nextItem(): LinkedListItem<TValue> | null {
    return this._nextItem
  }

  // set nextItem(rawNextItem: LinkedListItem<TValue> | null) {
  //   this.setNextItem(rawNextItem)
  // }

  setNextItem(rawNextItem: LinkedListItem<TValue> | null) {
    this._nextItem = rawNextItem

    return this
  }

  deleteNextItem() {
    this._nextItem = null

    return this
  }

}

function useLinkedListItem<TValue = unknown>(
  rawValue: TItemDefaultValue<TValue>,
  rawNextItem: LinkedListItem<TValue> | null = null
): LinkedListItem<TValue> {
  return new LinkedListItem(rawValue, rawNextItem)
}

export { LinkedListItem, useLinkedListItem }
