import { configDotenv } from 'dotenv'
import { Stack, useStack } from '@/structures/Stack'
import type { TItemDefaultValue } from "@/structures/Item";

configDotenv({
  quiet: true,
  path: `.env.${process.env.NODE_ENV}`
})

const ITEM_ONE = 1
const ITEM_TWO = 2

describe(`${Stack.name}`, () => {

  it(`Should create proper instance of ${Stack.name}`, () => {
    const stack = useStack<number>()
    let val: TItemDefaultValue<number> = stack.popItem()

    expect(stack.isEmpty).toBeTruthy()
    expect(stack.peekValue).toBeNull()
    expect(val).toBeNull()

    // Add item
    stack.pushItem(ITEM_ONE).pushItem(ITEM_TWO)

    expect(stack.isEmpty).toBeFalsy()
    expect(stack.peekValue).toBe(ITEM_TWO)

    // Get item
    val = stack.popItem()

    expect(val).toBe(ITEM_TWO)
    expect(stack.peekValue).toBe(ITEM_ONE)

    // Empty stack
    val = stack.popItem()

    expect(val).toBe(ITEM_ONE)
    expect(stack.peekValue).toBeNull()
    expect(stack.isEmpty).toBeTruthy()
  })

})
