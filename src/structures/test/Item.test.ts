import { configDotenv } from 'dotenv'
import { Item, useItem } from '@/structures/Item'

configDotenv({
  quiet: true,
  path: `.env.${process.env.NODE_ENV}`
})

const ITEM_VAL = 100500
const STRING_VAL = '1001'

describe(`${Item.name}`, () => {

  it(`Should create proper instance of ${Item.name}`, () => {
    const item = useItem<number>(ITEM_VAL)

    expect(item.value).toBe(ITEM_VAL)

    // Reset value
    const newVal = ITEM_VAL - 500

    item.setValue(newVal)

    expect(item.value).toBe(newVal)

    // Check custom stringify handler
    expect(item.toString((rawVal) => `${rawVal! / 100 + 1}`)).toBe(STRING_VAL)

    // Delete value
    item.resetValue()

    expect(item.value).toBeUndefined()

    // Static methods
    let msg: string

    try { Item.throwNoComparator() } catch (exc) {
      msg = (exc as Error).toString()

      expect(msg).toBe(`Error: ${Item.name}: No item comparator has been set`)
    }

  })

})
