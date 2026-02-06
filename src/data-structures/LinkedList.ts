import {
  type TItemDefaultValue,
  type TItemDefaultFinder,
  type TItemDefaultChecker,
  type TItemDefaultComparator,
  type TItemDefaultStringifier,
  type ItemComparator,
  useItemComparator
} from '@/data-structures/Item'
import {
  LinkedListItem,
  useLinkedListItem
} from '@/data-structures/LinkedListItem'

const FAIL_INDEX = -1
const HEAD_INDEX = 0

export default class LinkedList<TValue = unknown> {

  static name = 'LinkedList'

  protected _headItem: LinkedListItem<TValue> | null

  protected _tailItem: LinkedListItem<TValue> | null

  protected _compare: ItemComparator

  constructor(readonly rawComparator?: TItemDefaultComparator) {
    this._compare = useItemComparator(rawComparator)
    this._headItem = null
    this._tailItem = null
  }

  get headItem(): LinkedListItem<TValue> | null {
    return this._headItem
  }

  get tailItem(): LinkedListItem<TValue> | null {
    return this._tailItem
  }

  protected _createNewItem(
    rawNewItem: LinkedListItem<TValue> | TItemDefaultValue<TValue>
  ): LinkedListItem<TValue> {
    const newItem = rawNewItem instanceof LinkedListItem ?
      rawNewItem :
      useLinkedListItem<TValue>(rawNewItem)

    newItem.deleteNextItem()

    return newItem
  }

  protected _createNewChecker(
    rawSeek?: TItemDefaultFinder<TValue> | LinkedListItem<TValue> | TItemDefaultValue<TValue> | null
  ): TItemDefaultChecker<LinkedListItem<TValue>> | null {
    if (typeof rawSeek === 'function') {
      return (item) => (rawSeek as TItemDefaultFinder<TValue>)(item.value)
    } else if (rawSeek instanceof LinkedListItem) {
      // @ts-ignore I didn't get what TS wants here
      return (item) => this._compare.isEqual(item.value, rawSeek.value)
    } else if (rawSeek) {
      // @ts-ignore I didn't get what TS wants here
      return (item) => this._compare.isEqual(item.value, rawSeek)
    }

    return null
  }

  appendItem(rawNewItem: LinkedListItem<TValue> | TItemDefaultValue<TValue>) {
    if (!this._headItem || !this._tailItem) {
      return this.prependItem(rawNewItem)
    }

    const newNode = this._createNewItem(rawNewItem)

    this._tailItem.setNextItem(newNode)
    this._tailItem = newNode

    return this
  }

  insertItem(
    rawNewItem: LinkedListItem<TValue> | TItemDefaultValue<TValue>,
    rawSeek?: TItemDefaultFinder<TValue> | LinkedListItem<TValue> | TValue | null
  ) {
    if (!this._headItem) {
      return this.prependItem(rawNewItem)
    }

    const checker = this._createNewChecker(rawSeek)

    if (!checker) {
      return this
    }

    const newItem = this._createNewItem(rawNewItem)
    let currItem: LinkedListItem<TValue> | null = this._headItem

    while (currItem) {
      const { nextItem } = currItem

      if (nextItem && checker(nextItem)) {
        newItem.setNextItem(currItem.nextItem)
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

  insertItemByIndex(
    rawNewItem: LinkedListItem<TValue> | TItemDefaultValue<TValue>,
    rawIndex: number = 0
  ) {
    if (!this._headItem || rawIndex <= HEAD_INDEX) {
      return this.prependItem(rawNewItem)
    }

    let it0 = HEAD_INDEX
    const newItem = this._createNewItem(rawNewItem)
    let currItem: LinkedListItem<TValue> | null = this._headItem

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

  prependItem(rawNewItem: LinkedListItem<TValue> | TItemDefaultValue<TValue>) {
    const newNode = this._createNewItem(rawNewItem)

    newNode.setNextItem(this._headItem)

    this._headItem = newNode
    this._tailItem = this._tailItem || this._headItem

    return this
  }

  deleteHead(): LinkedListItem<TValue> | null {
    if (!this._headItem) {
      return null
    }

    const deletedNode: LinkedListItem<TValue> | null = this._headItem

    if (deletedNode.nextItem) {
      this._headItem = deletedNode.nextItem
    } else {
      this._headItem = null
      this._tailItem = null
    }

    return deletedNode
  }

  deleteItem(
    rawSeek?: TItemDefaultFinder<TValue> | LinkedListItem<TValue> | TItemDefaultValue<TValue> | null
  ): LinkedListItem<TValue> | null {
    let rmItem: LinkedListItem<TValue> | null = null

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

    let currItem: LinkedListItem<TValue> | null = this._headItem

    while (currItem) {
      const { nextItem } = currItem

      if (nextItem && checker(nextItem)) {
        rmItem = nextItem

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

  deleteItemByIndex(rawIndex: number = 0): LinkedListItem<TValue> | null {
    let rmItem: LinkedListItem<TValue> | null = null

    if (!this._headItem || !this._tailItem) {
      return rmItem
    } else if (rawIndex <= HEAD_INDEX) {
      return this.deleteHead()
    }

    let it0 = HEAD_INDEX
    let currItem: LinkedListItem<TValue> | null = this._headItem

    while (currItem) {
      it0 += 1
      const { nextItem } = currItem

      if (nextItem && it0 === rawIndex) {
        rmItem = nextItem

        currItem.setNextItem(nextItem.nextItem)

        break
      }

      currItem = currItem.nextItem
    }

    if (rmItem && this._compare.isEqual(this._tailItem.value, rmItem.value)) {
      this._tailItem = rmItem
    }

    return rmItem
  }

  deleteTail(): LinkedListItem<TValue> | null {
    return this.deleteItem(this._tailItem)
  }

  hasItem(
    rawSeek?: TItemDefaultFinder<TValue> | LinkedListItem<TValue> | TValue | null
  ): boolean {
    return !!this.findItem(rawSeek)
  }

  findItem(
    rawSeek?: TItemDefaultFinder<TValue> | LinkedListItem<TValue> | TItemDefaultValue<TValue> | null
  ): LinkedListItem<TValue> | null {
    if (!this._headItem) {
      return null
    }

    const checker = this._createNewChecker(rawSeek)

    if (!checker) {
      return null
    }

    let currItem: LinkedListItem<TValue> | null = this._headItem

    while (currItem) {
      if (checker(currItem)) {
        return currItem
      }

      currItem = currItem.nextItem
    }

    return null
  }

  findItemIndex(
    rawSeek?: TItemDefaultFinder<TValue> | LinkedListItem<TValue> | TItemDefaultValue<TValue> | null
  ): number {
    if (!this._headItem) {
      return FAIL_INDEX
    }

    const checker = this._createNewChecker(rawSeek)

    if (!checker) {
      return FAIL_INDEX
    }

    let it0 = HEAD_INDEX
    let currItem: LinkedListItem<TValue> | null = this._headItem

    while (currItem) {
      if (checker(currItem)) {
        return it0
      }

      currItem = currItem.nextItem
      it0 += 1
    }

    return FAIL_INDEX
  }

  findItemByIndex(rawIndex: number): LinkedListItem<TValue> | null {
    if (rawIndex < HEAD_INDEX || !this._headItem) {
      return null
    }

    let it0 = HEAD_INDEX
    let currItem: LinkedListItem<TValue> | null = this._headItem

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

    let currItem: LinkedListItem<TValue> | null = this._headItem
    let prevItem: LinkedListItem<TValue> | null = null
    let nextItem: LinkedListItem<TValue> | null = null

    while (currItem) {
      nextItem = currItem.nextItem

      currItem.setNextItem(prevItem)

      prevItem = currItem
      currItem = nextItem
    }

    this._tailItem = this._headItem
    this._headItem = prevItem

    return this
  }

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

function useLinkedList<TValue = unknown>(compareHandler?: TItemDefaultComparator): LinkedList<TValue> {
  return new LinkedList<TValue>(compareHandler)
}

export { LinkedList, useLinkedList }
