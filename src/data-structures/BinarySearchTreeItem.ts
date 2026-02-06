import { ItemComparator, type TItemDefaultValue } from '@/data-structures/Item'
import { BinaryTreeItem } from '@/data-structures/BinaryTreeItem'
import { useBinarySearchTree } from '@/data-structures/BinarySearchTree'

export default class BinarySearchTreeItem<TValue = unknown> extends BinaryTreeItem<TValue> {

  static name = 'BinarySearchTreeItem'

  constructor(
    readonly rawValue: TItemDefaultValue<TValue>,
    readonly rawItemComparator?: ItemComparator | null
  ) {
    super(rawValue, rawItemComparator)
  }

  get leftChild(): BinarySearchTreeItem<TValue> | null {
    return this._leftChild as BinarySearchTreeItem<TValue> | null
  }

  get rightChild(): BinarySearchTreeItem<TValue> | null {
    return this._rightChild as BinarySearchTreeItem<TValue> | null
  }

  get parentItem(): BinarySearchTreeItem<TValue> | null {
    return this._parentItem as BinarySearchTreeItem<TValue> | null
  }

  get uncleItem(): BinarySearchTreeItem<TValue> | null {
    return super.uncleItem as BinarySearchTreeItem<TValue> | null
  }

  insertItem(rawNewItem: BinarySearchTreeItem<TValue> | TItemDefaultValue<TValue>) {
    if (!this._compare) {
      BinarySearchTreeItem.throwNoComparator()

      return this
    }

    const newValue = rawNewItem instanceof BinarySearchTreeItem ?
      rawNewItem.value :
      rawNewItem

    if (this._compare.isEqual(this._value, null)) {
      // If current value is empty, set given value
      // to the current item
      return this.setValue(newValue)
    }

    const newItem = rawNewItem instanceof BinarySearchTreeItem ?
      rawNewItem :
      useBinarySearchTreeItem<TValue>(rawNewItem, this._compare)

    if (this._compare.isLess(newValue, this._value)) {
      // Insert item to the left child
      const leftChild = this.leftChild

      if (leftChild) {
        // If left child exists, insert item into it
        return leftChild.insertItem(newItem)
      }

      // If not — create left child
      this.setLeftChild(newItem)
    }

    if (this._compare.isGreater(newValue, this._value)) {
      // Insert item to the right child
      const rightChild = this.rightChild as BinarySearchTreeItem<TValue> | null

      if (rightChild) {
        // If right child exists, insert item into it
        return rightChild.insertItem(newItem)
      }

      // If not — create right child
      this.setRightChild(newItem)
    }

    return this
  }

  deleteItem(rawRmItem: BinarySearchTreeItem<TValue> | TItemDefaultValue<TValue>): BinarySearchTreeItem<TValue> | null {
    // Base item deletion method should be based on direct
    // item link via argument to have opportunity to make
    // additional filters above of the deletion operation
    if (!this._compare) {
      BinarySearchTreeItem.throwNoComparator()

      return this
    }

    // Find removing item by given value if needed
    const rmItem = rawRmItem instanceof BinarySearchTreeItem ?
      rawRmItem :
      this.findItem(rawRmItem)

    if (!rmItem) {
      BinarySearchTreeItem.throwNoItem('deletion')

      return null
    }

    if (rmItem.isLeaf) {
      // Item is a leaf and has no children
      if (rmItem.parentItem) {
        // Item has a parent. Just remove the pointer to
        // this item from the parent
        rmItem.parentItem.deleteChild(rmItem)
      } else {
        // Item has no parent. Just erase current item value
        rmItem.resetValue()
      }
    } else if (rmItem.isBinternal) {
      // Item is internal (has both children). Find the next
      // biggest value (minimum value in the right branch)
      const biggestChild = rmItem.rightChild!.findMin()

      if (!this._compare.isEqual(biggestChild, this._rightChild)) {
        // Replace current item value with that next
        // biggest value
        this.deleteItem(rmItem)

        rmItem.setValue(biggestChild.value)
      } else {
        // In case if next right value is the next bigger
        // one, and it doesn't have left child, just replace
        // item that is going to be deleted with the right item
        rmItem.
          setValue(this.rightChild!.value).
          setRightChild(this.rightChild!.rightChild)
      }
    } else {
      // Item has only one child
      const childItem = this.rightChild ?
        this.rightChild :
        this.leftChild

      if (this.parentItem) {
        // Make this child to be a direct child of current
        // item's parent
        this.parentItem.replaceChild(rmItem, childItem)
      } else {
        // Replace removing item with the child item
        BinarySearchTreeItem.copyItem<TValue>(childItem, rmItem)
      }
    }

    // Clear the parent of removed item
    rmItem.deleteParentItem()

    return rmItem
  }

  findMin(): BinarySearchTreeItem<TValue> {
    if (!this.leftChild) {
      return this
    }

    return this.leftChild.findMin()
  }

  findItem(rawValue: BinarySearchTreeItem<TValue> | TItemDefaultValue<TValue>): BinarySearchTreeItem<TValue> | null {
    if (!this._compare) {
      BinarySearchTreeItem.throwNoComparator()

      return null
    }

    const seekValue = rawValue instanceof BinarySearchTreeItem ?
      rawValue.value :
      rawValue

    // Check the root
    if (this._compare.isEqual(seekValue, this.value)) {
      return this
    }

    // Check left child
    const leftChild = this.leftChild

    if (leftChild && this._compare.isLess(leftChild.value, this.value)) {
      return leftChild.findItem(seekValue)
    }

    // Check right child
    const rightChild = this.rightChild

    if (rightChild && this._compare.isGreater(rightChild.value, this.value)) {
      return rightChild.findItem(seekValue)
    }

    // Nothing found
    return null
  }

  hasItem(rawValue: TItemDefaultValue<TValue>): boolean {
    return !!this.findItem(rawValue)
  }

}

function useBinarySearchTreeItem<TValue = unknown>(
  rawValue: TItemDefaultValue<TValue>,
  rawItemComparator?: ItemComparator | null
): BinarySearchTreeItem<TValue> {
  return new BinarySearchTreeItem<TValue>(rawValue, rawItemComparator)
}

export {
  BinarySearchTreeItem,
  useBinarySearchTreeItem
}
