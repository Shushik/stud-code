import {
  type TItemDefaultValue,
  type TItemDefaultComparator,
  type TItemDefaultStringifier,
  Item,
  ItemComparator,
  useItem,
  useItemComparator,
} from '@/data-structures/Item'

const FAIL_INDEX = -1
const STEP = 2
const LEFT_STEP = 1
const RIGHT_STEP = 2
const PARENT_STEP = 1

export default abstract class Heap<TValue = unknown> {

  static name = 'Heap'

  protected _compare: ItemComparator

  protected _container: Item<TValue>[]

  protected constructor(readonly rawComparator?: TItemDefaultComparator) {
    if (new.target === Heap) {
      Heap.throwError('Class cannot be used directly')
    }

    // Array of heap items
    this._container = [ ]
    this._compare = useItemComparator(rawComparator)
  }

  get lastIndex(): number {
    return this._container.length - 1
  }

  get peekItem(): Item<TValue> | null {
    if (this._container.length === 0) {
      return null
    }

    return this._container[0]
  }

  static throwError(rawMessage: string) {
    throw new Error(`${this.name}: ${rawMessage}`)
  }

  static throwOutOfRange(...rawIndexes: number[]): null {
    const message = rawIndexes.length > 1 ?
      `Chosen indexes (${rawIndexes.join(', ')}) aren't in range` :
      `Chosen index (${rawIndexes[0]}) isn't in range`

    this.throwError(message)

    return null
  }

  protected _isInRange(rawIndex: number): boolean {
    return !(rawIndex < 0 || rawIndex > this.lastIndex)
  }

  protected _normalizeIndex(rawIndex: number): number {
    const { lastIndex } = this

    if (rawIndex < 0) {
      return 0
    } else if (rawIndex > lastIndex) {
      return lastIndex
    }

    return rawIndex
  }

  getLeftChild(rawParentIndex: number): Item<TValue> | null {
    if (this._isInRange(rawParentIndex)) {
      return Heap.throwOutOfRange(rawParentIndex)
    }

    const leftIndex = this.getLeftIndex(rawParentIndex)
    const leftChild = this._container[leftIndex]

    return leftChild || null
  }

  hasLeftChild(rawParentIndex: number): boolean {
    return this._isInRange(rawParentIndex)
    // return this.getLeftIndex(rawParentIndex) < this._container.length
  }

  getLeftIndex(rawParentIndex: number): number {
    return (STEP * rawParentIndex) + LEFT_STEP
  }

  getRightChild(rawParentIndex: number): Item<TValue> | null {
    if (this._isInRange(rawParentIndex)) {
      return Heap.throwOutOfRange(rawParentIndex)
    }

    const rightIndex = this.getRightIndex(rawParentIndex)
    const rightChild = this._container[rightIndex]

    return rightChild || null
  }

  hasRightChild(rawParentIndex: number): boolean {
    return this._isInRange(rawParentIndex)
    // return this.getRightIndex(rawParentIndex) < this._container.length
  }

  getRightIndex(rawParentIndex: number): number {
    return (STEP * rawParentIndex) + RIGHT_STEP
  }

  getParentItem(rawChildIndex: number): Item<TValue> | null {
    if (this._isInRange(rawChildIndex)) {
      return Heap.throwOutOfRange(rawChildIndex)
    }

    return this._container[this.getParentIndex(rawChildIndex)]
  }

  hasParentItem(rawChildIndex: number): boolean {
    return this._isInRange(rawChildIndex)
    // return this.getParentIndex(rawChildIndex) >= 0
  }

  getParentIndex(rawChildIndex: number): number {
    return Math.floor((rawChildIndex - PARENT_STEP) / STEP)
  }

  pollItem(): Item<TValue> | null {
    if (!this._container.length) {
      // No items
      return null
    }

    const lastItem = this._container.pop() as Item<TValue>

    if (!this._container.length) {
      // Single item
      return lastItem
    }

    // Move the last element to the head
    this._container[0] = lastItem

    this.heapifyDown()

    return lastItem
  }

  insertItem(rawNewItem: Item<TValue> | TItemDefaultValue<TValue>) {
    const newItem = rawNewItem instanceof Item ?
      rawNewItem :
      useItem(rawNewItem)

    this._container.push(newItem)

    this.heapifyUp()

    return this
  }

  deleteItem(rawRmIndex: number) {
    if (!this._isInRange(rawRmIndex)) {
      Heap.throwOutOfRange(rawRmIndex)

      return this
    }

    this._deleteItemByIndex(rawRmIndex)

    return this
  }

  protected _deleteItemByIndex(rawRmIndex: number) {
    // If need to remove last child in the heap, —
    // just remove it without heapify afterwards
    if (rawRmIndex === this.lastIndex) {
      this._container.pop()
    } else {
      // Move last element in heap to the vacant (removed) position
      this._container[rawRmIndex] = this._container.pop() as Item<TValue>

      // Get parent
      const rmItem = this._container[rawRmIndex]
      const parentItem = this.getParentItem(rawRmIndex)

      // If there is no parent or parent is in correct order
      // with the item, delete then heapify down
      //
      // Otherwise heapify up
      if (
        this.hasLeftChild(rawRmIndex) &&
        (!parentItem || this.checkPairOrder(parentItem, rmItem))
      ) {
        this.heapifyDown(rawRmIndex)
      } else {
        this.heapifyUp(rawRmIndex)
      }
    }
  }

  deleteItems(
    rawItem: Item<TValue> | TItemDefaultValue<TValue>,
    rawComparator?: ItemComparator
  ) {
    const comparator = rawComparator !== undefined ?
      rawComparator :
      this._compare

    // Find number of items to remove
    let rmIndies = this._findItems(rawItem, comparator)
    const rmIndiesLength = rmIndies.length

    for (let it0 = 0; it0 < rmIndiesLength; it0++) {
      const rmIndex = rmIndies.pop() as number

      this._deleteItemByIndex(rmIndex)

      // Need to find item index to remove each time
      // after removal since indices are being changed
      // after each heapify process
      rmIndies = this._findItems(rawItem, comparator)
    }

    return this
  }

  findItems(rawItem: Item<TValue> | TItemDefaultValue<TValue>, rawComparator?: ItemComparator) {
    const comparator = rawComparator !== undefined ?
      rawComparator :
      this._compare

    this._findItems(rawItem, comparator)
  }

  protected _findItems(rawItem: Item<TValue> | TItemDefaultValue<TValue>, comparator: ItemComparator): number[] {
    const foundIndies: number[] = [ ]

    if (!rawItem || !this._container.length) {
      return foundIndies
    }

    for (let it0 = 0; it0 < this._container.length; it0++) {
      const currItem = this._container[it0]

      if (comparator.isEqual(rawItem, currItem)) {
        foundIndies.push(it0)
      }
    }

    return foundIndies
  }

  swapItems(rawIndexOne: number, rawIndexTwo: number): boolean {
    if (!this._isInRange(rawIndexOne) || !this._isInRange(rawIndexTwo)) {
      Heap.throwOutOfRange(rawIndexOne, rawIndexTwo)

      return false
    }

    const tmpItem = this._container[rawIndexTwo]

    this._container[rawIndexTwo] = this._container[rawIndexOne]
    this._container[rawIndexOne] = tmpItem

    return true
  }

  heapifyUp(rawStartIndex?: number) {
    if (!this._container.length) {
      return this
    }

    // Take the last item (last in array or the bottom left in a tree)
    // in the heap container and lift it up until it is in the correct
    // order with respect to its parent element.
    let currIndex = rawStartIndex !== undefined ?
      this._normalizeIndex(rawStartIndex) :
      this.lastIndex
    let parentIndex = this.getParentIndex(currIndex)

    while (
      this.hasParentItem(currIndex) &&
      !this.checkPairOrder(this._container[parentIndex], this._container[currIndex])
    ) {
      this.swapItems(currIndex, parentIndex)

      currIndex = parentIndex
      parentIndex = this.getParentIndex(currIndex)
    }

    return this
  }

  heapifyDown(rawStartIndex?: number) {
    if (!this._container.length) {
      return this
    }

    // Compare the parent item to its children and swap parent with the appropriate
    // child (smallest child for MinHeap, largest child for MaxHeap).
    // Do the same for next children after swap.
    let currIndex = rawStartIndex !== undefined ?
      this._normalizeIndex(rawStartIndex) :
      0

    while (this.hasLeftChild(currIndex)) {
      const leftChild = this.getLeftChild(currIndex)
      const rightChild = this.getRightChild(currIndex)

      const nextIndex = rightChild !== null && this.checkPairOrder(rightChild, leftChild) ?
        this.getRightIndex(currIndex) :
        this.getLeftIndex(currIndex)

      const currItem = this._container[currIndex]
      const nextItem = this._container[nextIndex]

      if (this.checkPairOrder(currItem, nextItem)) {
        break
      }

      this.swapItems(currIndex, nextIndex)

      currIndex = nextIndex
    }

    return this
  }

  protected checkPairOrder(
    rawItemOne: Item<TValue> | null,
    rawItemTwo: Item<TValue> | null
  ): boolean {
    // Checks if pair of heap items is in correct order
    //
    // For MinHeap the first element must be always smaller or equal.
    // For MaxHeap the first element must be always bigger or equal.
    Heap.throwError(`
      You have to implement .checkPairOrderIsCorrect() method
      in your Heap instance
    `)

    return false
  }

  valueOf(): Item<TValue>[] {
    return this._container
  }

  toString(stringifier?: TItemDefaultStringifier<TValue>): string {
    let res = ''

    for (let it0 = 0; it0 < this._container.length; it0++) {
      const item = this._container[it0]

      res += res ? ',' : ''
      res += item.toString(stringifier)
    }

    return res
  }

}

export { Heap }
