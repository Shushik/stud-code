import { configDotenv } from 'dotenv'
import {
  type TItemDefaultComparator,
  ItemComparator,
  useItemComparator
} from '@/data-structures/Item'

configDotenv({
  quiet: true,
  path: `.env.${process.env.NODE_ENV}`
})

interface IItem {
  value: number
}

const comparator: TItemDefaultComparator = (rawA: unknown, rawB: unknown) => {
  const a = rawA as IItem
  const b = rawB as IItem

  return a.value - b.value
}

const SIMPLE_A = 2
const SIMPLE_B = 4
const OBJECT_A = { value: SIMPLE_A }
const OBJECT_B = { value: SIMPLE_B }

describe(`${ItemComparator.name}`, () => {

  it(`Should create proper instance of ${ItemComparator.name}`, () => {
    let itemComparator: ItemComparator

    itemComparator = useItemComparator()

    expect(itemComparator.compare).not.toBeNull()
    expect(itemComparator.isReversed).toBeFalsy()

    // Use without external handler
    expect(itemComparator.isEqual(SIMPLE_A + SIMPLE_B, SIMPLE_B)).toBeFalsy()
    expect(itemComparator.isEqual(SIMPLE_A + SIMPLE_A, SIMPLE_B)).toBeTruthy()

    expect(itemComparator.isLess(SIMPLE_A * SIMPLE_B, SIMPLE_B)).toBeFalsy()
    expect(itemComparator.isLess(SIMPLE_A, SIMPLE_B)).toBeTruthy()

    expect(itemComparator.isGreater(SIMPLE_A, SIMPLE_B)).toBeFalsy()
    expect(itemComparator.isGreater(SIMPLE_A * SIMPLE_B, SIMPLE_B)).toBeTruthy()

    expect(itemComparator.isLessOrEqual(SIMPLE_A * SIMPLE_B, SIMPLE_B)).toBeFalsy()
    expect(itemComparator.isLessOrEqual(SIMPLE_A, SIMPLE_B)).toBeTruthy()
    expect(itemComparator.isLessOrEqual(SIMPLE_A + SIMPLE_A, SIMPLE_B)).toBeTruthy()

    expect(itemComparator.isGreaterOrEqual(SIMPLE_A, SIMPLE_B)).toBeFalsy()
    expect(itemComparator.isGreaterOrEqual(SIMPLE_B, SIMPLE_A)).toBeTruthy()
    expect(itemComparator.isGreaterOrEqual(SIMPLE_B, SIMPLE_A + SIMPLE_A)).toBeTruthy()

    // Use with first external handler
    itemComparator = useItemComparator(comparator) as ItemComparator

    expect(itemComparator.isEqual(OBJECT_A, OBJECT_B)).toBeFalsy()
    expect(itemComparator.isLess(OBJECT_A, OBJECT_B)).toBeTruthy()

    // Reverse handler
    itemComparator.reverseComparator()

    expect(itemComparator.isReversed).toBeTruthy()
    expect(itemComparator.isGreater(OBJECT_A, OBJECT_B)).toBeTruthy()

    itemComparator.resetComparator()

    expect(itemComparator.isReversed).toBeFalsy()
    expect(itemComparator.isLess(OBJECT_A, OBJECT_B)).toBeTruthy()
  })

})
