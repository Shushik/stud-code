import { configDotenv } from 'dotenv'
import { LinkedListItem, useLinkedListItem } from '@/data-structures/LinkedListItem'

configDotenv({
  quiet: true,
  path: `.env.${process.env.NODE_ENV}`
})

const ITEM_VAL = 100500
const NEXT_VAL = ITEM_VAL - 500

describe(`${LinkedListItem.name}`, () => {

  it(`Should create proper instance of ${LinkedListItem.name}`, () => {
    const item = useLinkedListItem<number>(ITEM_VAL)

    expect(item.value).toBe(ITEM_VAL)
    expect(item.nextItem).toBeNull()

    // Add nextItem
    const nextItem = useLinkedListItem<number>(NEXT_VAL)

    item.setNextItem(nextItem)

    expect(item.nextItem).not.toBeNull()
    expect(item.nextItem!.value).toBe(NEXT_VAL)

    // Remove nextItem
    item.deleteNextItem()

    expect(item.nextItem).toBeNull()
  })

  // Static methods
  let msg: string

  try {
    LinkedListItem.throwNoComparator()
  } catch (exc) {
    msg = (exc as Error).toString()

    expect(msg).toBe(`Error: ${LinkedListItem.name}: No item comparator has been set`)
  }

})
