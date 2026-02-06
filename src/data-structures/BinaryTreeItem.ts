import {
  type TItemDefaultValue,
  Item,
  ItemComparator,
} from '@/data-structures/Item'

type TChildKey = 'left' | 'right'

const WIDTH_ZERO = 0
const WIDTH_STEP = 1
const HEIGHT_ZERO = 0
const HEIGHT_STEP = 1
const LEFT_KEY = 'left'
const RIGHT_KEY = 'right'

export default class BinaryTreeItem<TValue = TItemDefaultValue> extends Item<TValue> {

  static name = 'BinaryTreeItem'

  protected _compare: ItemComparator | null

  protected _leftChild: BinaryTreeItem<TValue> | null

  protected _rightChild: BinaryTreeItem<TValue> | null

  protected _parentItem: BinaryTreeItem<TValue> | null

  constructor(
    readonly rawValue: TItemDefaultValue<TValue>,
    readonly rawItemComparator?: ItemComparator | null
  ) {
    super(rawValue)

    // Made local comparator as a link to an external
    // comparator, which is placed in a BinaryTree root
    // object, so as not to create comparator object
    // in each BinaryTreeItem instance (just like
    // in LinkedList and DoublyLinkedList)
    this._compare = rawItemComparator instanceof ItemComparator ?
      rawItemComparator :
      null
    this._leftChild = null
    this._rightChild = null
    this._parentItem = null
  }

  get isLeaf(): boolean {
    // Leaf item has no children
    return !this._leftChild && !this._rightChild
  }

  get isInternal(): boolean {
    // Internal item has at least one child
    return !!(this._leftChild || this._rightChild)
  }

  get isBinternal(): boolean {
    // Binternal (both internal) item has both
    // (left and right) children
    return !!(this._leftChild && this._rightChild)
  }

  get width(): number {
    return this.leftWidth + this.rightWidth
  }

  get height(): number {
    // The length of the longest downward path from that item
    // to a leaf, defining the item's position within
    // the hierarchy
    return Math.max(this.leftHeight, this.rightHeight);
  }

  get leftChild(): BinaryTreeItem<TValue> | null {
    return this._leftChild
  }

  get leftWidth(): number {
    if (!this._leftChild) {
      return WIDTH_ZERO
    }

    return this._leftChild.leftWidth + WIDTH_STEP
  }

  get leftHeight(): number {
    if (!this._leftChild) {
      return HEIGHT_ZERO
    }

    return this._leftChild.height + HEIGHT_STEP
  }

  get rightChild(): BinaryTreeItem<TValue> | null {
    return this._rightChild
  }

  get rightWidth(): number {
    if (!this._rightChild) {
      return WIDTH_ZERO
    }

    return this._rightChild.rightWidth + WIDTH_STEP
  }

  get rightHeight(): number {
    if (!this._rightChild) {
      return HEIGHT_ZERO
    }

    return this._rightChild.height + HEIGHT_STEP
  }

  // Parent's sibling if it exists
  get uncleItem(): BinaryTreeItem<TValue> | null {
    // Check if current item has parent
    if (!this.parentItem || !this._compare) {
      return null
    }

    // Check if current item has grandparent item
    const granparentItem = this.parentItem.parentItem

    if (!granparentItem) {
      return null
    }

    // Check if grandparent item has both children
    if (!granparentItem.leftChild || !granparentItem.rightChild) {
      return null
    }

    // So for now we know that current item has grandparent
    // and this grandparent has two children
    if (this._compare.isEqual(this.parentItem, granparentItem.leftChild)) {
      // Right child is the uncle item
      return granparentItem.rightChild
    }

    // Left child is the uncle item
    return granparentItem.leftChild
  }

  get parentItem(): BinaryTreeItem<TValue> | null {
    return this._parentItem
  }

  get balanceFactor(): number {
    return this.leftHeight - this.rightHeight
  }

  static getChildKey(rawKey: TChildKey): string {
    // Cheat for both keys changes
    return `_${rawKey}Child`
  }

  static copyItem<TValue = unknown>(
    rawSrcItem: BinaryTreeItem<TValue> | null,
    rawToItem?: BinaryTreeItem<TValue> | null
  ): BinaryTreeItem<TValue> | null {
    if (!rawSrcItem) {
      return null
    }

    // Set or create copy item here to get it as BinaryTreeItem<TValue>,
    // not Item<TValue> as it comes from super.copyItem() method
    const toItem: BinaryTreeItem<TValue> | null = rawToItem ?
      rawToItem :
      useBinaryTreeItem<TValue>(undefined)

    // Get Item with copied base props
    if (
      !super.copyItem<TValue>(
        rawSrcItem as unknown as Item<TValue> | null,
        toItem as unknown as Item<TValue> | null
      )
    ) {
      return null
    }

    // Copy BinaryTreeItem props
    toItem.setLeftChild(rawSrcItem.leftChild)
    toItem.setRightChild(rawSrcItem.rightChild)

    return toItem
  }

  copyItemTo(
    toItem: BinaryTreeItem<TValue> | null
  ): BinaryTreeItem<TValue> | null {
    return BinaryTreeItem.copyItem<TValue>(this, toItem)
  }

  copyItemFrom(
    srcItem: BinaryTreeItem<TValue> | null
  ): BinaryTreeItem<TValue> | null {
    return BinaryTreeItem.copyItem<TValue>(srcItem, this)
  }

  protected _setChild(
    rawItem: BinaryTreeItem<TValue> | null,
    childKey: TChildKey
  ) {
    // Common logic for setting left or right children
    const key = BinaryTreeItem.getChildKey(childKey)

    // Reset parent for item since it is going to be detached
    if (this[key]) {
      this[key].deleteParentItem()
    }

    // Reset chosen child
    this[key] = rawItem

    // Set current item as a parent
    if (this[key]) {
      this[key].setParentItem(this)
    }

    return this
  }

  setLeftChild(rawItem: BinaryTreeItem<TValue> | null): BinaryTreeItem<TValue> {
    return this._setChild(rawItem, LEFT_KEY)
  }

  setRightChild(rawItem: BinaryTreeItem<TValue> | null): BinaryTreeItem<TValue> {
    return this._setChild(rawItem, RIGHT_KEY)
  }

  protected _deleteChild(
    rmChild: BinaryTreeItem<TValue> | null,
    childKey: TChildKey
  ): BinaryTreeItem<TValue> | null {
    // Common logic for deleting left or right child
    if (!this._compare) {
      this.constructor.throwNoComparator()

      return null
    }

    const key = BinaryTreeItem.getChildKey(childKey)
    let deletedChild: BinaryTreeItem<TValue> | null = null

    if (this[key] && this._compare.isEqual(this[key], rmChild)) {
      // If child exists, set it to null
      deletedChild = this[key]

      this[key] = null
    }

    return deletedChild
  }

  deleteChild(rmChild: BinaryTreeItem<TValue> | null): boolean {
    if (!rmChild) {
      return false
    }

    // Delete left or right child via compare
    return !!this._deleteChild(rmChild, RIGHT_KEY) ||
      !!this._deleteChild(rmChild, LEFT_KEY)
  }

  deleteLeftChild(): boolean {
    return !!this._deleteChild(this._leftChild, LEFT_KEY)
  }

  deleteRightChild(): boolean {
    return !!this._deleteChild(this._rightChild, RIGHT_KEY)
  }

  protected _replaceChild(
    mvChild: BinaryTreeItem<TValue> | null,
    newChild: BinaryTreeItem<TValue> | null,
    childKey: TChildKey
  ): BinaryTreeItem<TValue> | null {
    // Common logic for replacing left or right child
    if (!this._compare) {
      this.constructor.throwNoComparator()

      return null
    }

    const key = BinaryTreeItem.getChildKey(childKey)
    let replacedChild: BinaryTreeItem<TValue> | null = null

    if (this[key] && this._compare.isEqual(this[key], mvChild)) {
      // If child exists, reset it with a new item
      replacedChild = this[key]

      this[key] = newChild
    }

    return replacedChild
  }

  replaceChild(
    mvChild: BinaryTreeItem<TValue> | null,
    newChild: BinaryTreeItem<TValue> | null
  ): boolean {
    if (!mvChild || !newChild) {
      this.constructor.throwNoItem('replacement')

      return false
    }

    // Replace left or right child via compare
    return !!this._replaceChild(mvChild, newChild, RIGHT_KEY) ||
      !!this._replaceChild(mvChild, newChild, LEFT_KEY)
  }

  replaceLeftChild(newChild: BinaryTreeItem<TValue> | null): boolean {
    return !!this._replaceChild(this._leftChild, newChild, LEFT_KEY)
  }

  replaceRightChild(newChild: BinaryTreeItem<TValue> | null): boolean {
    return !!this._replaceChild(this._rightChild, newChild, RIGHT_KEY)
  }

  setParentItem(rawItem: BinaryTreeItem<TValue> | null): BinaryTreeItem<TValue> {
    this._parentItem = rawItem

    return this
  }

  deleteParentItem() {
    this.setParentItem(null)

    return this
  }

  traverseInOrder(): TItemDefaultValue<TValue>[] {
    let traversed: TItemDefaultValue<TValue>[] = [ ]

    // Add left item(s)
    if (this.leftChild) {
      traversed = traversed.concat(this.leftChild.traverseInOrder())
    }

    // Add root
    traversed.push(this.value)

    // Add right item(s)
    if (this.rightChild) {
      traversed = traversed.concat(this.rightChild.traverseInOrder())
    }

    return traversed
  }

  // @ts-ignore Same property warning in inherited class? Really?
  valueOf(): TItemDefaultValue<TValue>[] {
    return this.traverseInOrder()
  }

  // @ts-ignore And this property isn't the same? Right?
  toString(): string {
    return this.traverseInOrder().toString()
  }

}

function useBinaryTreeItem<TValue = unknown>(
  rawValue: TItemDefaultValue<TValue>,
  rawComparator?: ItemComparator
): BinaryTreeItem<TValue> {
  return new BinaryTreeItem<TValue>(rawValue, rawComparator)
}

export { BinaryTreeItem, useBinaryTreeItem }
