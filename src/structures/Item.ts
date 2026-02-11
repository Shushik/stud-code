type TItemDefaultValue<TValue = unknown> = TValue | undefined | null
type TItemDefaultFinder<TValue = unknown> = (val: TItemDefaultValue<TValue>) => boolean
type TItemDefaultChecker<TItem> = (item: TItem) => boolean
type TItemDefaultComparator = (a: unknown, b: unknown) => number
type TItemDefaultStringifier<TValue> = (val: TItemDefaultValue<TValue>) => string

abstract class AItem<TValue = unknown> {

  protected _value: TItemDefaultValue<TValue>

  protected constructor(readonly rawValue: TItemDefaultValue<TValue>) {
    this._value = rawValue
  }

  get value(): TItemDefaultValue<TValue> {
    return this._value
  }

  // set value(rawValue: TItemDefaultValue<TValue>) {
  //   this.setValue(rawValue)
  // }


  setValue(rawValue: TItemDefaultValue<TValue>) {
    this._value = rawValue

    return this
  }

  resetValue() {
    this._value = undefined

    return this
  }

  valueOf(): TItemDefaultValue<TValue> {
    return this._value
  }

  toString(stringifier?: TItemDefaultStringifier<TValue>): string {
    if (this._value === undefined || this._value === null) {
      return ''
    }

    return typeof stringifier === 'function' ?
      stringifier(this._value) :
      this._value.toString()
  }

}

export default class Item<TValue = unknown> extends AItem<TValue> {

  static name = 'Item'

  constructor(readonly rawValue: TItemDefaultValue<TValue>) {
    super(rawValue)
  }

  static throwError(rawMessage: string) {
    throw new Error(`${this.name}: ${rawMessage}`)
  }

  static throwNoComparator(): null {
    this.throwError('No item comparator has been set')

    return null
  }

  static throwNoItem(rawAction?: string): null {
    const actionString = rawAction ? ` for ${rawAction}` : ''

    this.throwError(`No item found${actionString}`)

    return null
  }

  static copyItem<TValue = unknown>(
    rawSrcItem: Item<TValue> | null,
    rawToItem?: Item<TValue> | null
  ): Item<TValue> | null {
    if (!rawSrcItem) {
      this.throwNoItem('copying')

      return null
    }

    // Create empty source Item if not exist
    const toItem: Item<TValue> | null = rawToItem ?
      rawToItem :
      useItem<TValue>(undefined)

    // Copy Item props
    toItem.setValue(rawSrcItem.value)

    return toItem
  }

}

function useItem<TValue = unknown>(rawValue: TItemDefaultValue<TValue>): Item<TValue> {
  return new Item<TValue>(rawValue)
}


const IS_LESS = -1
const IS_EQUAL = 0
const IS_GREATER = 1

// Default comparator can work with values and with
// Item-like objects, comparing their .value props
const useDefaultItemComparator: TItemDefaultComparator = function(
  rawA: unknown,
  rawB: unknown
) {
  if (!rawA && !rawB) {
    return IS_EQUAL
  } else if (rawB && !rawA) {
    return IS_LESS
  } else if (rawA && !rawB) {
    return IS_GREATER
  }

  const a = (typeof rawA === 'object' ? (rawA as Item).value : rawA) as number
  const b = (typeof rawB === 'object' ? (rawB as Item).value : rawB) as number

  if (a === b) {
    return IS_EQUAL
  }

  return a < b ? IS_LESS : IS_GREATER
}


class ItemComparator {

  static name = 'ItemComparator'

  protected _isReversed: boolean

  protected _externalComparator: TItemDefaultComparator | null

  compare: TItemDefaultComparator

  constructor(readonly externalComparator?: TItemDefaultComparator) {
    this._isReversed = false

    // Set external comparator handler or use default
    if (externalComparator) {
      this.compare = externalComparator
      this._externalComparator = externalComparator
    } else {
      this.compare = useDefaultItemComparator
      this._externalComparator = null
    }
  }

  get isReversed(): boolean {
    return this._isReversed
  }

  isEqual(a: unknown, b: unknown): boolean {
    return this.compare(a, b) === IS_EQUAL
  }

  isLess(a: unknown, b: unknown): boolean {
    return this.compare(a, b) < IS_EQUAL
  }

  isGreater(a: unknown, b: unknown): boolean {
    return this.compare(a, b) > IS_EQUAL
  }

  isLessOrEqual(a: unknown, b: unknown): boolean {
    return this.isLess(a, b) || this.isEqual(a, b)
  }

  isGreaterOrEqual(a: unknown, b: unknown): boolean {
    return this.isGreater(a, b) || this.isEqual(a, b)
  }

  protected setComparator(externalComparator?: TItemDefaultComparator) {
    this._isReversed = false

    if (externalComparator) {
      this.compare = externalComparator
    } else if (this._externalComparator) {
      this.compare = this._externalComparator
    } else {
      this.compare = useDefaultItemComparator
    }

    return this
  }

  resetComparator() {
    this.setComparator()
  }

  reverseComparator(): ItemComparator {
    if (!this._isReversed) {
      const { compare } = this

      this._isReversed = true

      this.compare = (a, b) => compare(b, a)
    } else {
      this.resetComparator()
    }

    return this
  }

}

function useItemComparator(externalComparator?: TItemDefaultComparator) {
  return new ItemComparator(externalComparator)
}


export {
  TItemDefaultValue,
  TItemDefaultFinder,
  TItemDefaultChecker,
  TItemDefaultComparator,
  TItemDefaultStringifier,
  AItem,
  Item,
  ItemComparator,
  useItem,
  useItemComparator,
  useDefaultItemComparator
}
