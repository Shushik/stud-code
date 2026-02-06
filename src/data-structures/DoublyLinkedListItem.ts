import { type TItemDefaultValue } from '@/data-structures/Item'
import { LinkedListItem } from '@/data-structures/LinkedListItem'

export default class DoublyLinkedListItem<TValue = TItemDefaultValue> extends LinkedListItem<TValue> {

  static name = 'DoublyLinkedListItem'

  protected _prevItem: DoublyLinkedListItem<TValue> | null

  constructor(
    readonly rawValue: TItemDefaultValue<TValue>,
    readonly rawNextItem: DoublyLinkedListItem<TValue> | null = null,
    readonly rawPrevItem: DoublyLinkedListItem<TValue> | null = null
  ) {
    super(rawValue, rawNextItem)

    this._prevItem = rawPrevItem
  }

  get nextItem(): DoublyLinkedListItem<TValue> | null {
    return super.nextItem as DoublyLinkedListItem<TValue> | null
  }

  get prevItem(): DoublyLinkedListItem<TValue> | null {
    return this._prevItem as DoublyLinkedListItem<TValue> | null
  }

  // set prevItem(rawPrevItem: DoublyLinkedListItem<TValue> | null) {
  //   this.setPrevItem(rawPrevItem)
  // }

  setPrevItem(rawPrevItem: DoublyLinkedListItem<TValue> | null) {
    this._prevItem = rawPrevItem
  }

  deletePrevItem() {
    this._prevItem = null
  }

}

function useDoublyLinkedListItem<TValue = unknown>(
  rawValue: TItemDefaultValue<TValue>,
  rawNextItem: DoublyLinkedListItem<TValue> | null = null,
  rawPrevItem: DoublyLinkedListItem<TValue> | null = null
): DoublyLinkedListItem<TValue> {
  return new DoublyLinkedListItem<TValue>(
    rawValue,
    rawNextItem,
    rawPrevItem,
  )
}

export { DoublyLinkedListItem, useDoublyLinkedListItem }
