import {
  type TItemDefaultValue,
  type TItemDefaultComparator,
  ItemComparator,
  useItemComparator
} from '@/structures/Item'
import {
  BinarySearchTreeItem,
  useBinarySearchTreeItem
} from '@/structures/BinarySearchTreeItem'

export default class BinarySearchTree<TValue = unknown> {

  static name = 'BinarySearchTree'

  protected _compare: ItemComparator

  protected _rootItem: BinarySearchTreeItem<TValue>

  constructor(readonly rawComparator?: TItemDefaultComparator) {
    this._compare = useItemComparator(rawComparator)
    this._rootItem = useBinarySearchTreeItem<TValue>(null, this._compare)
  }

  get rootItem(): BinarySearchTreeItem<TValue> {
    return this._rootItem
  }

  insertItem(rawValue: TItemDefaultValue<TValue>) {
    this._rootItem.insertItem(rawValue)

    return this
  }

  hasItem(rawValue: TItemDefaultValue<TValue>): boolean {
    return this._rootItem.hasItem(rawValue)
  }

  findItem(rawValue: TItemDefaultValue<TValue>): BinarySearchTreeItem<TValue> | null {
    return this._rootItem.findItem(rawValue)
  }

  valueOf() {
    return this._rootItem.valueOf()
  }

  toString() {
    return this._rootItem.toString()
  }

}

function useBinarySearchTree<TValue = unknown>(
  rawComparator?: TItemDefaultComparator
): BinarySearchTree<TValue> {
  return new BinarySearchTree<TValue>(rawComparator)
}

export { BinarySearchTree, useBinarySearchTree }
