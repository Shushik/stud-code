import { configDotenv } from 'dotenv'
import { LinkedList, useLinkedList } from '@/data-structures/LinkedList'
import { useLinkedListItem } from '@/data-structures/LinkedListItem'

configDotenv({
  quiet: true,
  path: `.env.${process.env.NODE_ENV}`
})

const FAIL_VAL = 100500
const HEAD_VAL = 1
const ITEM_VAL = 2
const TAIL_VAL = 3
const FOUR_VAL = 4
const FIVE_VAL = 5
const SIX_VAL = 6
const SEVEN_VAL = 7

const FAIL_POS = -1
const HEAD_POS = 0
const ITEM_POS = 1
const TAIL_POS = 2
const FOUR_POS = 3
const FIVE_POS = 4
const SIX_POS = 5
const SEVEN_POS = 6

const ITEMS_ARR = [
  FOUR_VAL,
  HEAD_VAL,
  ITEM_VAL,
  TAIL_VAL,
  SEVEN_VAL,
  SIX_VAL,
  FIVE_VAL
]
const ITEMS_STR = ITEMS_ARR.toString()

function useLinkedListPrefilled(): LinkedList<number> {
  const linkedList = useLinkedList<number>()

  linkedList.appendItem(ITEM_VAL)
  linkedList.prependItem(HEAD_VAL)
  linkedList.appendItem(TAIL_VAL)

  return linkedList
}

describe(`${LinkedList.name}`, () => {

  it(`Should create proper instance of ${LinkedList.name}`, () => {
    let linkedList = useLinkedList<number>()

    expect(linkedList.headItem).toBeNull()
    expect(linkedList.tailItem).toBeNull()
    expect(linkedList.findItem(HEAD_VAL)).toBeNull()
    expect(linkedList.findItemByIndex(TAIL_POS))
    expect(linkedList.findItemIndex(TAIL_VAL)).toBe(FAIL_POS)

    // Get filled list
    linkedList = useLinkedListPrefilled()

    expect(linkedList.headItem).not.toBeNull()
    expect(linkedList.tailItem).not.toBeNull()
    expect(linkedList.tailItem!.nextItem).toBeNull()
    expect(linkedList.findItem(HEAD_VAL)!.value).toBe(HEAD_VAL)
    expect(linkedList.findItem(ITEM_VAL)!.value).toBe(ITEM_VAL)
    expect(linkedList.findItem(TAIL_VAL)!.value).toBe(TAIL_VAL)
    expect(linkedList.hasItem(ITEM_VAL)).toBeTruthy()
    expect(linkedList.findItemByIndex(HEAD_POS)!.value).toBe(HEAD_VAL)
    expect(linkedList.findItemByIndex(ITEM_POS)!.value).toBe(ITEM_VAL)
    expect(linkedList.findItemByIndex(TAIL_POS)!.value).toBe(TAIL_VAL)
    expect(linkedList.findItemIndex(HEAD_VAL)).toBe(HEAD_POS)
    expect(linkedList.findItemIndex(ITEM_VAL)).toBe(ITEM_POS)
    expect(linkedList.findItemIndex(TAIL_VAL)).toBe(TAIL_POS)

    // Insert some items
    const newItem = useLinkedListItem<number>(SIX_VAL)

    linkedList.prependItem(FOUR_VAL)
    linkedList.appendItem(FIVE_VAL)
    linkedList.insertItem(newItem, linkedList.tailItem!)
    linkedList.insertItemByIndex(SEVEN_VAL, linkedList.findItemIndex(newItem))

    expect(linkedList.headItem!.value).toBe(FOUR_VAL)
    expect(linkedList.tailItem!.value).toBe(FIVE_VAL)
    expect(linkedList.findItemByIndex(SIX_POS)!.value).toBe(SIX_VAL)
    expect(linkedList.findItem(newItem)).not.toBeNull()
    expect(linkedList.findItemIndex(SEVEN_VAL)).toBe(FIVE_POS)
    expect(linkedList.hasItem(FAIL_VAL)).toBeFalsy()
    expect(linkedList.findItemIndex(FAIL_VAL)).toBe(FAIL_POS)
    expect(linkedList.toArray().map((item) => item.value)).toEqual(ITEMS_ARR)
    expect(linkedList.valueOf()).toEqual(ITEMS_ARR)
    expect(linkedList.toString()).toBe(ITEMS_STR)
    expect(linkedList.tailItem!.nextItem).toBeNull()

    // Delete some items
    linkedList.deleteItem(newItem)
    linkedList.deleteItemByIndex(FIVE_POS)
    linkedList.deleteHead()
    linkedList.deleteTail()

    expect(linkedList.findItem(newItem)).toBeNull()
    expect(linkedList.hasItem(SEVEN_VAL)).toBeFalsy()
    expect(linkedList.hasItem(FOUR_VAL)).toBeFalsy()
    expect(linkedList.hasItem(FIVE_VAL)).toBeFalsy()
    expect(linkedList.headItem!.value).toBe(HEAD_VAL)
    expect(linkedList.tailItem!.value).toBe(TAIL_VAL)
    expect(linkedList.findItemIndex(ITEM_VAL)).toBe(ITEM_POS)
    expect(linkedList.tailItem!.nextItem).toBeNull()

    // Misc operations
    linkedList.reverseItems()

    expect(linkedList.valueOf()).toEqual([ TAIL_VAL, ITEM_VAL, HEAD_VAL ])
    expect(linkedList.headItem!.value).toBe(TAIL_VAL)
    expect(linkedList.tailItem!.value).toBe(HEAD_VAL)
  })
})
