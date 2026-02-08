import { configDotenv } from 'dotenv'
import { useItemComparator } from '@/structures/Item'
import {
  BinarySearchTreeItem,
  useBinarySearchTreeItem
} from '@/structures/BinarySearchTreeItem'

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
const CHILD1_VAL = -1
const CHILD2_VAL = -2
const CHILD3_VAL = -3
const CHILD4_VAL = 1
const CHILD5_VAL = 2
const CHILD6_VAL = 3
const CHILD7_VAL = 4
const TRAVERSED_ARR = [
  CHILD1_VAL,
  ROOT_VAL,
  CHILD4_VAL,
  CHILD3_VAL,
  CHILD5_VAL,
  CHILD2_VAL
]

const compare = useItemComparator()

describe(`${BinarySearchTreeItem.name}`, () => {

  it(`Should create proper instance of ${BinarySearchTreeItem.name}`, () => {
    let root = useBinarySearchTreeItem<number>(ROOT_VAL)
    let child1: BinarySearchTreeItem<number>
    let child2: BinarySearchTreeItem<number>
    let child3: BinarySearchTreeItem<number>
    let child4: BinarySearchTreeItem<number>
    let child5: BinarySearchTreeItem<number>
    let child6: BinarySearchTreeItem<number> | null
    let child7: BinarySearchTreeItem<number>

    expect(root.value).toBe(ROOT_VAL)
    expect(root.height).toBe(HEIGHT_ZERO)
    expect(root.balanceFactor).toBe(BALANCE_ZERO)
    expect(root.leftChild).toBeNull()
    expect(root.leftHeight).toBe(HEIGHT_ZERO)
    expect(root.rightChild).toBeNull()
    expect(root.rightHeight).toBe(HEIGHT_ZERO)
    expect(root.parentItem).toBeNull()
    expect(root.uncleItem).toBeNull()

    try { root.insertItem(null) } catch (exc) {
      expect((exc as Error).toString()).toBe(
        `Error: ${BinarySearchTreeItem.name}: No item comparator has been set`
      )
    }

    // Set value, add children
    root = useBinarySearchTreeItem<number>(ROOT_VAL, compare)
    child1 = useBinarySearchTreeItem<number>(CHILD1_VAL, compare)
    child2 = useBinarySearchTreeItem<number>(CHILD2_VAL, compare)
    child3 = useBinarySearchTreeItem<number>(CHILD3_VAL, compare)
    child4 = useBinarySearchTreeItem<number>(CHILD4_VAL, compare)
    child5 = useBinarySearchTreeItem<number>(CHILD5_VAL, compare)

    root.insertItem(child1)
    root.insertItem(child2)
    root.insertItem(child3)
    root.insertItem(child4)
    root.insertItem(child5)

    // @todo


  })

})
