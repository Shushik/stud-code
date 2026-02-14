import { type TItemDefaultValue, Item } from '@/structures/Item'

/**
 * Item for LinkedList
 *
 * @class LinkedListItem
 */
export default class LinkedListItem<TValue = unknown> extends Item<TValue> {

  /**
   * Class name
   *
   * @static
   * @property {string} name
   */
  static name = 'LinkedListItem'

  /**
   * Internal next item link
   *
   * @protected
   * @property {LinkedListItem|null} _nextItem
   */
  _nextItem: LinkedListItem<TValue> | null

  /**
   * @constructor
   * @param {*} rawValue
   * @param {LinkedListItem|null} rawNextItem
   */
  constructor(
    readonly rawValue: TItemDefaultValue<TValue>,
    readonly rawNextItem: LinkedListItem<TValue> | null = null
  ) {
    super(rawValue)

    this._nextItem = rawNextItem
  }

  /**
   * External next item link
   *
   * @readonly
   * @property {LinkedListItem|null} nextItem
   */
  get nextItem(): LinkedListItem<TValue> | null {
    return this._nextItem
  }

  // set nextItem(rawNextItem: LinkedListItem<TValue> | null) {
  //   this.setNextItem(rawNextItem)
  // }

  /**
   * Set next item link
   *
   * @method setNextItem
   * @param {LinkedListItem|null} rawNextItem
   */
  setNextItem(rawNextItem: LinkedListItem<TValue> | null) {
    this._nextItem = rawNextItem

    return this
  }

  /**
   * Remove next item link
   *
   * @method deleteNextItem
   */
  deleteNextItem() {
    this._nextItem = null

    return this
  }

}

/**
 * Function wrapper returns LinkedListItem instance
 *
 * @function useLinkedListItem
 * @param {*} rawValue
 * @param {LinkedListItem|null} rawNextItem
 * @returns LinkedListItem
 */
function useLinkedListItem<TValue = unknown>(
  rawValue: TItemDefaultValue<TValue>,
  rawNextItem: LinkedListItem<TValue> | null = null
): LinkedListItem<TValue> {
  return new LinkedListItem(rawValue, rawNextItem)
}

export { LinkedListItem, useLinkedListItem }
