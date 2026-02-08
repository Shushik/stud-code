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
  DoublyLinkedListItem,
  useDoublyLinkedListItem
} from '@/structures/DoublyLinkedListItem'

const FAIL_INDEX = -1
const HEAD_INDEX = 0

export default class DoublyLinkedList<TValue = unknown> {

  static name = 'DoublyLinkedList'

  protected _headItem: DoublyLinkedListItem<TValue> | null

  protected _tailItem: DoublyLinkedListItem<TValue> | null

  protected _compare: ItemComparator

  constructor(readonly rawComparator?: TItemDefaultComparator) {
    this._compare = useItemComparator(rawComparator)
    this._headItem = null
    this._tailItem = null
  }

  get headItem(): DoublyLinkedListItem<TValue> | null {
    return this._headItem
  }

  get tailItem(): DoublyLinkedListItem<TValue> | null {
    return this._tailItem
  }

  protected _createNewItem(
    rawNewItem: DoublyLinkedListItem<TValue> | TItemDefaultValue<TValue>
  ): DoublyLinkedListItem<TValue> {
    const newItem = rawNewItem instanceof DoublyLinkedListItem ?
      rawNewItem :
      useDoublyLinkedListItem<TValue>(rawNewItem)

    newItem.deleteNextItem()
    newItem.deletePrevItem()

    return newItem
  }

  protected _createNewChecker(
    rawSeek?: TItemDefaultFinder<TValue> | DoublyLinkedListItem<TValue> | TItemDefaultValue<TValue> | null
  ): TItemDefaultChecker<DoublyLinkedListItem<TValue>> | null {
    if (typeof rawSeek === 'function') {
      return (item) => (rawSeek as TItemDefaultFinder<TValue>)(item.value)
    } else if (rawSeek instanceof DoublyLinkedListItem) {
      // @ts-ignore I didn't get what TS wants here
      return (item) => this._compare.isEqual(item.value, rawSeek.value)
    } else if (rawSeek) {
      // @ts-ignore I didn't get what TS wants here
      return (item) => this._compare.isEqual(item.value, rawSeek)
    }

    return null
  }

  appendItem(rawNewItem: DoublyLinkedListItem<TValue> | TItemDefaultValue<TValue>) {
    if (!this._headItem || !this._tailItem) {
      return this.prependItem(rawNewItem)
    }

    const newNode = this._createNewItem(rawNewItem)

    newNode.setPrevItem(this._tailItem)

    this._tailItem.setNextItem(newNode)
    this._tailItem = newNode

    return this
  }

  insertItem(
    rawNewItem: DoublyLinkedListItem<TValue> | TItemDefaultValue<TValue>,
    rawSeek?: TItemDefaultFinder<TValue> | DoublyLinkedListItem<TValue> | TItemDefaultValue<TValue> | null
  ) {
    if (!this._headItem) {
      return this.prependItem(rawNewItem)
    }

    const checker = this._createNewChecker(rawSeek)

    if (!checker) {
      return this
    }

    const newItem = this._createNewItem(rawNewItem)
    let currItem: DoublyLinkedListItem<TValue> | null = this._headItem

    while (currItem) {
      const { nextItem } = currItem

      if (nextItem && checker(nextItem)) {
        newItem.setPrevItem(currItem)
        newItem.setNextItem(nextItem)
        currItem.setNextItem(newItem)
        currItem = newItem.nextItem

        break
      }

      currItem = nextItem
    }

    if (!currItem) {
      return this.appendItem(rawNewItem)
    }

    return this
  }

  insertItemByIndex(rawNewItem: DoublyLinkedListItem<TValue> | TItemDefaultValue<TValue>, rawIndex: number = 0) {
    if (!this._headItem || rawIndex <= HEAD_INDEX) {
      return this.prependItem(rawNewItem)
    }

    let it0 = HEAD_INDEX
    const newItem = this._createNewItem(rawNewItem)
    let currItem: DoublyLinkedListItem<TValue> | null = this._headItem

    while (currItem) {
      it0 += 1

      if (it0 === rawIndex) {
        newItem.setNextItem(currItem.nextItem)
        currItem.setNextItem(newItem)
        currItem = newItem.nextItem

        break
      }

      currItem = currItem.nextItem
    }

    if (!currItem) {
      return this.appendItem(rawNewItem)
    }

    return this
  }

  prependItem(rawNewItem: DoublyLinkedListItem<TValue> | TItemDefaultValue<TValue>) {
    const newNode = this._createNewItem(rawNewItem)

    newNode.setNextItem(this._headItem)

    if (this._headItem) {
      newNode.setNextItem(this._headItem)

      this._headItem.setPrevItem(newNode)
    }

    this._headItem = newNode
    this._tailItem = this._tailItem || this._headItem

    return this
  }

  deleteHead(): DoublyLinkedListItem<TValue> | null {
    if (!this._headItem) {
      return null
    }

    const deletedNode: DoublyLinkedListItem<TValue> | null = this._headItem

    if (deletedNode.nextItem) {
      this._headItem = deletedNode.nextItem
      this._headItem.deletePrevItem()
    } else {
      this._headItem = null
      this._tailItem = null
    }

    return deletedNode
  }

  deleteItem(
    rawSeek?: TItemDefaultFinder<TValue> | DoublyLinkedListItem<TValue> | TItemDefaultValue<TValue> | null
  ): DoublyLinkedListItem<TValue> | null {
    let rmItem: DoublyLinkedListItem<TValue> | null = null

    if (!this._headItem || !this._tailItem || rawSeek === undefined) {
      return rmItem
    }

    const checker = this._createNewChecker(rawSeek)

    if (!checker) {
      return rmItem
    }

    if (checker(this._headItem)) {
      return this.deleteHead()
    }

    let currItem: DoublyLinkedListItem<TValue> | null = this._headItem

    while (currItem) {
      const { nextItem } = currItem

      if (nextItem && checker(nextItem)) {
        rmItem = nextItem

        nextItem.setPrevItem(currItem)
        currItem.setNextItem(nextItem.nextItem)

        break
      }

      currItem = nextItem
    }

    if (checker(this._tailItem)) {
      this._tailItem = currItem
    }

    return rmItem
  }

  deleteItemByIndex(rawIndex: number = 0): DoublyLinkedListItem<TValue> | null {
    let rmItem: DoublyLinkedListItem<TValue> | null = null

    if (!this._headItem || !this._tailItem) {
      return rmItem
    } else if (rawIndex <= HEAD_INDEX) {
      return this.deleteHead()
    }

    let it0 = HEAD_INDEX
    let currItem: DoublyLinkedListItem<TValue> | null = this._headItem

    while (currItem) {
      it0 += 1
      const { nextItem } = currItem

      if (nextItem && it0 === rawIndex) {
        rmItem = nextItem

        nextItem.setPrevItem(currItem)
        currItem.setNextItem(nextItem.nextItem)

        break
      }

      currItem = nextItem
    }

    if (rmItem && this._compare.isEqual(this._tailItem.value, rmItem.value)) {
      this._tailItem = rmItem
    }

    return rmItem
  }

  deleteTail(): DoublyLinkedListItem<TValue> | null {
    return this.deleteItem(this._tailItem)
  }

  hasItem(
    rawSeek?: TItemDefaultFinder<TValue> | DoublyLinkedListItem<TValue> | TItemDefaultValue<TValue> | null
  ): boolean {
    return !!this.findItem(rawSeek)
  }

  findItem(
    rawSeek?: TItemDefaultFinder<TValue> | DoublyLinkedListItem<TValue> | TItemDefaultValue<TValue> | null
  ): DoublyLinkedListItem<TValue> | null {
    if (!this._headItem) {
      return null
    }

    const checker = this._createNewChecker(rawSeek)

    if (!checker) {
      return null
    }

    let currItem: DoublyLinkedListItem<TValue> | null = this._headItem

    while (currItem) {
      if (checker(currItem)) {
        return currItem
      }

      currItem = currItem.nextItem
    }

    return null
  }

  findItemIndex(
    rawSeek?: TItemDefaultFinder<TValue> | DoublyLinkedListItem<TValue> | TItemDefaultValue<TValue> | null
  ): number {
    if (!this._headItem) {
      return FAIL_INDEX
    }

    const checker = this._createNewChecker(rawSeek)

    if (!checker) {
      return FAIL_INDEX
    }

    let it0 = HEAD_INDEX
    let currItem: DoublyLinkedListItem<TValue> | null = this._headItem

    while (currItem) {
      if (checker(currItem)) {
        return it0
      }

      currItem = currItem.nextItem
      it0 += 1
    }

    return FAIL_INDEX
  }

  findItemByIndex(rawIndex: number): DoublyLinkedListItem<TValue> | null {
    if (rawIndex < HEAD_INDEX || !this._headItem) {
      return null
    }

    let it0 = HEAD_INDEX
    let currItem: DoublyLinkedListItem<TValue> | null = this._headItem

    while (currItem) {
      if (currItem && it0 === rawIndex) {
        return currItem
      }

      currItem = currItem.nextItem
      it0 += 1
    }

    return null
  }

  reverseItems() {
    if (!this._headItem) {
      return this
    }

    let currItem: DoublyLinkedListItem<TValue> | null = this._headItem
    let prevItem: DoublyLinkedListItem<TValue> | null = null
    let nextItem: DoublyLinkedListItem<TValue> | null = null

    while (currItem) {
      nextItem = currItem.nextItem

      currItem.setNextItem(prevItem)
      currItem.setPrevItem(nextItem)

      prevItem = currItem
      currItem = nextItem
    }

    this._tailItem = this._headItem
    this._headItem = prevItem

    return this
  }

  valueOf(): TItemDefaultValue<TValue>[] {
    const valuesList: TValue[] = [ ]

    if (!this._headItem) {
      return valuesList
    }

    let currItem: DoublyLinkedListItem | null = this._headItem

    while (currItem) {
      valuesList.push(currItem.value as TValue)

      currItem = currItem.nextItem
    }

    return valuesList
  }

  toArray(): DoublyLinkedListItem<TValue>[] {
    const itemsList: DoublyLinkedListItem<TValue>[] = [ ]

    if (!this._headItem) {
      return itemsList
    }

    let currItem: DoublyLinkedListItem<TValue> | null = this._headItem

    while (currItem) {
      itemsList.push(currItem)

      currItem = currItem.nextItem
    }

    return itemsList
  }

  toString(stringifier?: TItemDefaultStringifier<TValue>): string {
    if (!this._headItem) {
      return ''
    }

    let nodesValues = ''
    let currNode: DoublyLinkedListItem<TValue> | null = this._headItem

    while (currNode) {
      nodesValues += `${nodesValues ? ',' : ''}${currNode.toString(stringifier)}`

      currNode = currNode.nextItem
    }

    return nodesValues
  }

}

function useDoublyLinkedList<TValue = unknown>(
  compareHandler?: TItemDefaultComparator
): DoublyLinkedList<TValue> {
  return new DoublyLinkedList<TValue>(compareHandler)
}

export { DoublyLinkedList, useDoublyLinkedList }
