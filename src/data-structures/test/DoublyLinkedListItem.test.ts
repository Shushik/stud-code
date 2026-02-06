import { configDotenv } from 'dotenv'
import { DoublyLinkedListItem, useDoublyLinkedListItem } from '@/data-structures/DoublyLinkedListItem'

configDotenv({
  quiet: true,
  path: `.env.${process.env.NODE_ENV}`
})

const ITEM_VAL = 100500
const NEXT_VAL = ITEM_VAL - 500
const PREV_VAL = ITEM_VAL + ITEM_VAL

describe.skip(`${DoublyLinkedListItem.name}`, () => {

  it(`Should create proper instance of ${DoublyLinkedListItem.name}`, () => {
    const item = useDoublyLinkedListItem<number>(ITEM_VAL)

    expect(item.value).toBe(ITEM_VAL)
    expect(item.nextItem).toBeNull()
    expect(item.prevItem).toBeNull()

    // Add nextItem
    const nextItem = useDoublyLinkedListItem<number>(NEXT_VAL)

    item.setNextItem(nextItem)

    expect(item.nextItem).not.toBeNull()
    expect(item.nextItem!.value).toBe(NEXT_VAL)

    // Add prevItem
    const prevItem = useDoublyLinkedListItem<number>(PREV_VAL)

    item.setPrevItem(prevItem)

    expect(item.prevItem).not.toBeNull()
    expect(item.prevItem!.value).toBe(PREV_VAL)

    // Delete prevItem
    item.deletePrevItem()

    expect(item.prevItem).toBeNull()
  })

})
