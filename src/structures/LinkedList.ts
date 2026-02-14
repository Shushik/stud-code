import {
  type TItemDefaultValue,
  type TItemDefaultFinder,
  type TItemDefaultChecker,
  type TItemDefaultComparator,
  type TItemDefaultStringifier,
  type ItemComparator,
  useItemComparator
} from '@/structures/Item'
import {
  LinkedListItem,
  useLinkedListItem
} from '@/structures/LinkedListItem'

/**
 * Index of non-existent item
 *
 * @const {number} FAIL_INDEX
 */
const FAIL_INDEX = -1

/**
 * Index of head item
 *
 * @const {number} HEAD_INDEX
 */
const HEAD_INDEX = 0

/**
 * LinkedList data structure
 *
 * @class LinkedList
 */
export default class LinkedList<TValue = unknown> {

  /**
   * Class name
   *
   * @static
   * @property {string} name
   */
  static name = 'LinkedList'

  /**
   * Head item of linked list
   *
   * @protected
   * @property {LinkedListItem|null} _headItem
   */
  protected _headItem: LinkedListItem<TValue> | null

  /**
   * Tail item of linked list
   *
   * @protected
   * @property {LinkedListItem|null} _tailItem
   */
  protected _tailItem: LinkedListItem<TValue> | null

  /**
   * Common item comparator for all attached items
   *
   * @protected
   * @property {ItemComparator} _compare
   */
  protected _compare: ItemComparator

  /**
   * @constructor
   * @param {ItemComparator?} rawComparator
   */
  constructor(readonly rawComparator?: TItemDefaultComparator) {
    this._compare = useItemComparator(rawComparator)
    this._headItem = null
    this._tailItem = null
  }

  /**
   * Public head item of linked list
   *
   * @readonly
   * @property {LinkedListItem|null} headItem
   */
  get headItem(): LinkedListItem<TValue> | null {
    return this._headItem
  }

  /**
   * Public tail item of linked list
   *
   * @readonly
   * @property {LinkedListItem|null} headItem
   */
  get tailItem(): LinkedListItem<TValue> | null {
    return this._tailItem
  }

  /**
   * Creates filled new item object from value
   * or returns it from Item instance
   *
   * @protected
   * @method _createNewItem
   * @param {LinkedListItem} rawNewItem
   * @returns {LinkedListItem}
   */
  protected _createNewItem(
    rawNewItem: LinkedListItem<TValue> | TItemDefaultValue<TValue>
  ): LinkedListItem<TValue> {
    // Create new Item instance
    const newItem = rawNewItem instanceof LinkedListItem ?
      rawNewItem :
      useLinkedListItem<TValue>(rawNewItem)

    // Cleanup
    newItem.deleteNextItem()

    return newItem
  }

  /**
   * Compiling new search function using in find method,
   * which is able to search using given function
   * or LinkedListItem.value, or just given value
   *
   * @protected
   * @method _createNewChecker
   * @param {Function|LinkedListItem|*} rawSeek
   * @returns {Function|null}
   */
  protected _createNewChecker(
    rawSeek?: TItemDefaultFinder<TValue> | LinkedListItem<TValue> | TItemDefaultValue<TValue> | null
  ): TItemDefaultChecker<LinkedListItem<TValue>> | null {
    if (typeof rawSeek === 'function') {
      // If external search function given, let's use it
      return (item) => (rawSeek as TItemDefaultFinder<TValue>)(item.value)
    } else if (rawSeek instanceof LinkedListItem) {
      // If LinkedListItem given, let's compare
      // by it's value property
      //
      // @ts-ignore I didn't get what TS wants here
      return (item) => this._compare.isEqual(item.value, rawSeek.value)
    } else if (rawSeek) {
      // If just any value given, let's use it as it is
      //
      // @ts-ignore I didn't get what TS wants here
      return (item) => this._compare.isEqual(item.value, rawSeek)
    }

    return null
  }

  /**
   * Add new item to the tail
   *
   * @method appendItem
   * @param {LinkedListItem|*} rawNewItem
   */
  appendItem(rawNewItem: LinkedListItem<TValue> | TItemDefaultValue<TValue>) {
    // No need to go further
    if (!this._headItem || !this._tailItem) {
      return this.prependItem(rawNewItem)
    }

    // Create new LinkedListItem instance
    const newItem = this._createNewItem(rawNewItem)

    // Set new item as a new tail item
    this._tailItem.setNextItem(newItem)
    this._tailItem = newItem

    return this
  }

  /**
   * Insert new item before given item by item value
   *
   * @method insertItem
   * @param {LinkedListItem|*} rawNewItem
   * @param {Function|LinkedListItem|*} rawSeek
   */
  insertItem(
    rawNewItem: LinkedListItem<TValue> | TItemDefaultValue<TValue>,
    rawSeek?: TItemDefaultFinder<TValue> | LinkedListItem<TValue> | TValue | null
  ) {
    // If list is empty, create head item
    if (!this._headItem) {
      return this.prependItem(rawNewItem)
    }

    // Get search function
    const checker = this._createNewChecker(rawSeek)

    // No need to go further
    if (!checker) {
      return this
    }

    // Create new item
    const newItem = this._createNewItem(rawNewItem)
    // Set first item for the iteration
    let currItem: LinkedListItem<TValue> | null = this._headItem

    // Iterate through items with ahead looking
    while (currItem) {
      const { nextItem } = currItem

      // If next item is needed one, place new item
      // before it
      if (nextItem && checker(nextItem)) {
        newItem.setNextItem(currItem.nextItem)
        currItem.setNextItem(newItem)
        currItem = newItem.nextItem

        break
      }

      currItem = nextItem
    }

    // If item hasn't been added anywhere,
    // add it to the end
    if (!currItem) {
      return this.appendItem(rawNewItem)
    }

    return this
  }

  /**
   * Insert new item before given item by known index
   *
   * @method insertItemByIndex
   * @param {LinkedListItem|*} rawNewItem
   * @param {number} rawIndex
   */
  insertItemByIndex(
    rawNewItem: LinkedListItem<TValue> | TItemDefaultValue<TValue>,
    rawIndex: number = 0
  ) {
    // If list is empty, create head item
    if (!this._headItem || rawIndex <= HEAD_INDEX) {
      return this.prependItem(rawNewItem)
    }

    // Get start index for iteration
    let it0 = HEAD_INDEX
    // Create new item
    const newItem = this._createNewItem(rawNewItem)
    // Get start item for iteration
    let currItem: LinkedListItem<TValue> | null = this._headItem

    // Iterate through items with ahead looking
    while (currItem) {
      it0 += 1

      // If next index is needed one, place new item
      // before it
      if (it0 === rawIndex) {
        newItem.setNextItem(currItem.nextItem)
        currItem.setNextItem(newItem)
        currItem = newItem.nextItem

        break
      }

      currItem = currItem.nextItem
    }

    // If item hasn't been added anywhere,
    // add it to the end
    if (!currItem) {
      return this.appendItem(rawNewItem)
    }

    return this
  }

  /**
   * Add new item to the head
   *
   * @method prependItem
   * @param {LinkedListItem|*} rawNewItem
   */
  prependItem(rawNewItem: LinkedListItem<TValue> | TItemDefaultValue<TValue>) {
    // Create new item
    const newNode = this._createNewItem(rawNewItem)

    // Set new item as a new head item
    newNode.setNextItem(this._headItem)

    this._headItem = newNode
    this._tailItem = this._tailItem || this._headItem

    return this
  }

  /**
   * Remove head item
   *
   * @method deleteHead
   * @returns {LinkedListItem|null}
   */
  deleteHead(): LinkedListItem<TValue> | null {
    if (!this._headItem) {
      return null
    }

    // Remember previous head item
    const deletedNode: LinkedListItem<TValue> | null = this._headItem

    // Set new head item
    if (deletedNode.nextItem) {
      this._headItem = deletedNode.nextItem
    } else {
      this._headItem = null
      this._tailItem = null
    }

    return deletedNode
  }

  /**
   * Remove item by item value
   *
   * @method insertItem
   * @param {Function|LinkedListItem|*?} rawSeek
   * @returns {LinkedListItem|null}
   */
  deleteItem(
    rawSeek?: TItemDefaultFinder<TValue> | LinkedListItem<TValue> | TItemDefaultValue<TValue> | null
  ): LinkedListItem<TValue> | null {
    let rmItem: LinkedListItem<TValue> | null = null

    // No items
    if (!this._headItem || !this._tailItem || rawSeek === undefined) {
      return rmItem
    }

    // Get search function
    const checker = this._createNewChecker(rawSeek)

    // No need to go further
    if (!checker) {
      return rmItem
    }

    // If given item is head, remove head
    if (checker(this._headItem)) {
      return this.deleteHead()
    }

    // Get start item for iteration
    let currItem: LinkedListItem<TValue> | null = this._headItem

    // Iterate through items with ahead looking
    while (currItem) {
      const { nextItem } = currItem

      // If next item is needed one, remove this item
      if (nextItem && checker(nextItem)) {
        rmItem = nextItem

        currItem.setNextItem(nextItem.nextItem)

        break
      }

      currItem = nextItem
    }

    // Reset tail item if it has been removed
    if (checker(this._tailItem)) {
      this._tailItem = currItem
    }

    return rmItem
  }

  /**
   * Remove item by known item index
   *
   * @method insertItem
   * @param {number} rawIndex
   * @returns {LinkedListItem|null}
   */
  deleteItemByIndex(rawIndex: number = 0): LinkedListItem<TValue> | null {
    let rmItem: LinkedListItem<TValue> | null = null

    if (!this._headItem || !this._tailItem) {
      // No items
      return rmItem
    } else if (rawIndex <= HEAD_INDEX) {
      // If index is 0, remove head item
      return this.deleteHead()
    }

    // Get start index for iteration
    let it0 = HEAD_INDEX
    // Get start item for iteration
    let currItem: LinkedListItem<TValue> | null = this._headItem

    // Iterate through items with ahead looking
    while (currItem) {
      const { nextItem } = currItem

      it0 += 1

      // If next index is needed one, remove it
      if (nextItem && it0 === rawIndex) {
        // Remember item before remove
        rmItem = nextItem

        currItem.setNextItem(nextItem.nextItem)

        break
      }

      currItem = currItem.nextItem
    }

    // Reset tail item if it has been removed
    if (rmItem && this._compare.isEqual(this._tailItem.value, rmItem.value)) {
      this._tailItem = rmItem
    }

    return rmItem
  }

  /**
   * @method deleteTail
   * @returns {LinkedListItem|null}
   */
  deleteTail(): LinkedListItem<TValue> | null {
    return this.deleteItem(this._tailItem)
  }

  /**
   * Checks if item exists
   *
   * @method hasItem
   * @param {Function|LinkedListItem|*} rawSeek
   * @returns {boolean}
   */
  hasItem(
    rawSeek?: TItemDefaultFinder<TValue> | LinkedListItem<TValue> | TValue | null
  ): boolean {
    return !!this.findItem(rawSeek)
  }

  /**
   * Find item
   *
   * @method findItem
   * @param {Function|LinkedListItem|*?} rawSeek
   * @returns {LinkedListItem|null}
   */
  findItem(
    rawSeek?: TItemDefaultFinder<TValue> | LinkedListItem<TValue> | TItemDefaultValue<TValue> | null
  ): LinkedListItem<TValue> | null {
    // List is empty
    if (!this._headItem) {
      return null
    }

    // Get search function
    const checker = this._createNewChecker(rawSeek)

    // No need to go further
    if (!checker) {
      return null
    }

    // Get start item for iteration
    let currItem: LinkedListItem<TValue> | null = this._headItem

    // Iterate through items
    while (currItem) {
      // If next item is needed one, return it
      if (checker(currItem)) {
        return currItem
      }

      currItem = currItem.nextItem
    }

    // Return null if nothing found
    return null
  }

  /**
   * Get item index
   *
   * @method findItemIndex
   * @param {Function|LinkedListItem|*?} rawSeek
   * @returns {number} -1 if nothing found
   */
  findItemIndex(
    rawSeek?: TItemDefaultFinder<TValue> | LinkedListItem<TValue> | TItemDefaultValue<TValue> | null
  ): number {
    // List is empty
    if (!this._headItem) {
      return FAIL_INDEX
    }

    // Get search function
    const checker = this._createNewChecker(rawSeek)

    // No need to go further
    if (!checker) {
      return FAIL_INDEX
    }

    // Get start index for iteration
    let it0 = HEAD_INDEX
    // Get start item for iteration
    let currItem: LinkedListItem<TValue> | null = this._headItem

    // Iterate through items counting their index
    while (currItem) {
      // If next item is needed one, return its index
      if (checker(currItem)) {
        return it0
      }

      currItem = currItem.nextItem
      it0 += 1
    }

    // Return -1 otherwise
    return FAIL_INDEX
  }

  /**
   * Gets item by its known index
   *
   * @method findItemByIndex
   * @param {number} rawIndex
   * @returns {LinkedListItem|null}
   */
  findItemByIndex(rawIndex: number): LinkedListItem<TValue> | null {
    // List is empty or index is wrong
    if (rawIndex < HEAD_INDEX || !this._headItem) {
      return null
    }

    // Get start index for iteration
    let it0 = HEAD_INDEX
    // Get start item for iteration
    let currItem: LinkedListItem<TValue> | null = this._headItem

    // Iterate through items counting their index
    while (currItem) {
      // If next item is needed one, return this item
      if (currItem && it0 === rawIndex) {
        return currItem
      }

      currItem = currItem.nextItem
      it0 += 1
    }

    // Return null otherwise
    return null
  }

  /**
   * Reverse items order
   *
   * @method reverseItems
   */
  reverseItems() {
    // List is empty
    if (!this._headItem) {
      return this
    }

    // Get start item for iteration
    let currItem: LinkedListItem<TValue> | null = this._headItem
    let prevItem: LinkedListItem<TValue> | null = null
    let nextItem: LinkedListItem<TValue> | null = null

    // Iterate through items changing them by places
    while (currItem) {
      nextItem = currItem.nextItem

      currItem.setNextItem(prevItem)

      prevItem = currItem
      currItem = nextItem
    }

    // Change head and tail items by places
    this._tailItem = this._headItem
    this._headItem = prevItem

    return this
  }

  /**
   * Gets an array with items values
   *
   * @method valueOf
   */
  valueOf(): TItemDefaultValue<TValue>[] {
    const valuesList: TItemDefaultValue<TValue>[] = [ ]

    if (!this._headItem) {
      return valuesList
    }

    let currItem: LinkedListItem | null = this._headItem

    while (currItem) {
      valuesList.push(currItem.value as TValue)

      currItem = currItem.nextItem
    }

    return valuesList
  }

  /**
   * Gets an array with items objects
   *
   * @method toArray
   */
  toArray(): LinkedListItem<TValue>[] {
    const itemsList: LinkedListItem<TValue>[] = [ ]

    if (!this._headItem) {
      return itemsList
    }

    let currItem: LinkedListItem<TValue> | null = this._headItem

    while (currItem) {
      itemsList.push(currItem)

      currItem = currItem.nextItem
    }

    return itemsList
  }

  /**
   * Regular toString object method wrapper
   *
   * @method toString
   * @param {Function?} stringifier
   * @returns {string}
   */
  toString(stringifier?: TItemDefaultStringifier<TValue>): string {
    if (!this._headItem) {
      return ''
    }

    let nodesValues = ''
    let currNode: LinkedListItem<TValue> | null = this._headItem

    while (currNode) {
      nodesValues += `${nodesValues ? ',' : ''}${currNode.toString(stringifier)}`

      currNode = currNode.nextItem
    }

    return nodesValues
  }

}

/**
 * Function wrapper returns Item instance
 *
 * @function useLinkedList
 * @param {Function?} compareHandler
 * @returns {LinkedList}
 */
function useLinkedList<TValue = unknown>(compareHandler?: TItemDefaultComparator): LinkedList<TValue> {
  return new LinkedList<TValue>(compareHandler)
}

export { LinkedList, useLinkedList }
