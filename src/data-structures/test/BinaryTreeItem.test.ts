import { configDotenv } from 'dotenv'
import { useItemComparator } from '@/data-structures/Item'
import { BinaryTreeItem, useBinaryTreeItem } from '@/data-structures/BinaryTreeItem'

configDotenv({
  quiet: true,
  path: `.env.${process.env.NODE_ENV}`
})

const HEIGHT_LEFT = 1
const HEIGHT_STEP = 1
const HEIGHT_ZERO = 0
const HEIGHT_RIGHT = 3
const BALANCE_PLUS = 1
const BALANCE_ZERO = 0
const BALANCE_MINUS = -2
const ROOT_VAL = 0
const CHILD1_VAL = 1
const CHILD2_VAL = 2
const CHILD3_VAL = 3
const CHILD4_VAL = 4
const CHILD5_VAL = 5
const CHILD6_VAL = 6
const CHILD7_VAL = 7
const LEFT_CHILD_KEY = '_leftChild'
const RIGHT_CHILD_KEY = '_rightChild'
const TRAVERSED_ARR = [
  CHILD1_VAL,
  ROOT_VAL,
  CHILD4_VAL,
  CHILD3_VAL,
  CHILD5_VAL,
  CHILD2_VAL
]

const compare = useItemComparator()

describe(`${BinaryTreeItem.name}`, () => {

  it(`Should create proper instance of ${BinaryTreeItem.name}`, () => {
    let root = new BinaryTreeItem<number>(ROOT_VAL)
    let child1: BinaryTreeItem<number>
    let child2: BinaryTreeItem<number>
    let child3: BinaryTreeItem<number>
    let child4: BinaryTreeItem<number>
    let child5: BinaryTreeItem<number>
    let child6: BinaryTreeItem<number> | null
    let child7: BinaryTreeItem<number>

    expect(root.isLeaf).toBeTruthy()
    expect(root.isInternal).toBeFalsy()
    expect(root.isBinternal).toBeFalsy()
    expect(root.value).toBe(ROOT_VAL)
    expect(root.height).toBe(HEIGHT_ZERO)
    expect(root.balanceFactor).toBe(BALANCE_ZERO)
    expect(root.leftChild).toBeNull()
    expect(root.leftHeight).toBe(HEIGHT_ZERO)
    expect(root.rightChild).toBeNull()
    expect(root.rightHeight).toBe(HEIGHT_ZERO)
    expect(root.parentItem).toBeNull()
    expect(root.uncleItem).toBeNull()

    try { root.deleteChild(null) } catch (exc) {
      expect((exc as Error).toString()).toBe(
        `Error: ${BinaryTreeItem.name}: No item comparator has been set`
      )
    }

    // Set value, add children
    root = useBinaryTreeItem<number>(undefined, compare)
    child1 = useBinaryTreeItem<number>(CHILD1_VAL, compare)
    child2 = useBinaryTreeItem<number>(CHILD2_VAL, compare)
    child3 = useBinaryTreeItem<number>(CHILD3_VAL, compare)
    child4 = useBinaryTreeItem<number>(CHILD4_VAL, compare)
    child5 = useBinaryTreeItem<number>(CHILD5_VAL, compare)

    root.setValue(ROOT_VAL).
      setLeftChild(child1).
      setRightChild(child2)
    root.rightChild!.setLeftChild(child3)
    root.rightChild!.leftChild!.setLeftChild(child4)
    root.rightChild!.leftChild!.setRightChild(child5)

    expect(root.isLeaf).toBeFalsy()
    expect(root.value).toBe(ROOT_VAL)
    expect(root.height).toBe(HEIGHT_RIGHT)
    expect(root.balanceFactor).toBe(BALANCE_MINUS)
    expect(root.leftChild!.value).toBe(CHILD1_VAL)
    expect(root.leftHeight).toBe(HEIGHT_LEFT)
    expect(root.rightChild!.value).toBe(CHILD2_VAL)
    expect(root.rightHeight).toBe(HEIGHT_RIGHT)
    expect(root.rightChild!.leftChild!.parentItem!.value).toBe(CHILD2_VAL)
    expect(root.rightChild!.leftChild!.uncleItem!.value).toBe(CHILD1_VAL)
    expect(root.traverseInOrder()).toEqual(TRAVERSED_ARR)
    expect(root.toString()).toEqual(TRAVERSED_ARR.toString())
    expect(child3.isLeaf).toBeFalsy()
    expect(child3.isBinternal).toBeTruthy()
    expect(child5.isLeaf).toBeTruthy()

    // Copy and replace children
    child6 = BinaryTreeItem.copyItem(root.rightChild)
    child7 = useBinaryTreeItem<number>(CHILD7_VAL, compare)

    child6!.setValue(CHILD6_VAL)

    expect(child6!.leftChild!.value).toBe(CHILD3_VAL)
    expect(child6!.rightChild).toBeNull()

    root.replaceChild(root.leftChild, child6)
    root.leftChild!.leftChild!.leftChild!.setRightChild(child7)

    expect(root.height).toBe(HEIGHT_RIGHT + HEIGHT_STEP)
    expect(root.balanceFactor).toBe(BALANCE_ZERO)
    expect(root!.leftChild!.value).toBe(CHILD6_VAL)
    expect(child6!.leftChild!.balanceFactor).toBe(BALANCE_PLUS)

    // Delete children
    const height = root.leftHeight
    const deleteChild6 = root.deleteChild(child6)
    const deleteChild7 = root.deleteChild(child7)

    expect(deleteChild6).toBeTruthy()
    expect(deleteChild7).toBeFalsy()
    expect(root.isInternal).toBeTruthy()
    expect(root.isBinternal).toBeFalsy()
    expect(root.leftChild).toBeNull()
    expect(root.rightChild).not.toBeNull()
    expect(root.height).toBe(HEIGHT_RIGHT + HEIGHT_STEP)
    expect(root.balanceFactor).toBe(-height)

    const deleteLeft = root.deleteLeftChild()
    const deleteRight = root.deleteRightChild()

    expect(deleteLeft).toBeFalsy()
    expect(deleteRight).toBeTruthy()
    expect(root.rightChild).toBeNull()
    expect(root.height).toBe(HEIGHT_ZERO)
    expect(root.balanceFactor).toBe(BALANCE_ZERO)

    // Static methods
    expect(BinaryTreeItem.getChildKey('left')).toBe(LEFT_CHILD_KEY)
    expect(BinaryTreeItem.getChildKey('right')).toBe(RIGHT_CHILD_KEY)

    let msg: string

    try { BinaryTreeItem.throwNoItem() } catch (exc) {
      msg = (exc as Error).toString()

      expect(msg).toBe(`Error: ${BinaryTreeItem.name}: No item found`)
    }

    try { BinaryTreeItem.throwNoItem('deletion') } catch (exc) {
      msg = (exc as Error).toString()

      expect(msg).toBe(`Error: ${BinaryTreeItem.name}: No item found for deletion`)
    }

  })

})
