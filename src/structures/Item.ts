type TItemDefaultValue<TValue = unknown> = TValue | undefined | null
type TItemDefaultFinder<TValue = unknown> = (val: TItemDefaultValue<TValue>) => boolean
type TItemDefaultChecker<TItem> = (item: TItem) => boolean
type TItemDefaultComparator = (a: unknown, b: unknown) => number
type TItemDefaultStringifier<TValue> = (val: TItemDefaultValue<TValue>) => string

/**
 * Base abstract «blank» class for item with value
 *
 * @abstract
 * @class AItem
 */
abstract class AItem<TValue = unknown> {

  /**
   * Value of unknown type
   *
   * @protected
   * @property {*} _value
   */
  protected _value: TItemDefaultValue<TValue>

  /**
   * Constructor is protected due to this class is abstract
   *
   * @protected
   * @constructor
   * @param rawValue
   */
  protected constructor(readonly rawValue: TItemDefaultValue<TValue>) {
    this._value = rawValue
  }

  /**
   * Public value property
   *
   * @readonly
   * @property {*} value
   */
  get value(): TItemDefaultValue<TValue> {
    return this._value
  }

  // set value(rawValue: TItemDefaultValue<TValue>) {
  //   this.setValue(rawValue)
  // }

  /**
   * Sets _value property
   *
   * @method setValue
   * @param {*} rawValue
   */
  setValue(rawValue: TItemDefaultValue<TValue>) {
    this._value = rawValue

    return this
  }

  /**
   * Resets _value to undefined
   *
   * @method resetValue
   */
  resetValue() {
    this._value = undefined

    return this
  }

  /**
   * Regular valueOf object method wrapper
   *
   * @method valueOf
   * @returns {*}
   */
  valueOf(): TItemDefaultValue<TValue> {
    return this._value
  }

  /**
   * Regular toString object method wrapper
   *
   * @method toString
   * @param {Function?} stringifier
   * @returns {string}
   */
  toString(stringifier?: TItemDefaultStringifier<TValue>): string {
    // If empty, return empty string
    if (this._value === undefined || this._value === null) {
      return ''
    }

    // If stringifier exists, use it, otherwise
    // return default toString from _value prop
    return typeof stringifier === 'function' ?
      stringifier(this._value) :
      this._value.toString()
  }

}

/**
 * Base class for item
 *
 * @class Item
 * @extends AItem
 */
export default class Item<TValue = unknown> extends AItem<TValue> {

  /**
   * Class name
   *
   * @static
   * @property {string} name
   */
  static name = 'Item'

  /**
   * @constructor
   * @param {*} rawValue
   */
  constructor(readonly rawValue: TItemDefaultValue<TValue>) {
    super(rawValue)
  }

  /**
   * Throws common error with given message
   *
   * @static
   * @method throwError
   * @param {string} rawMessage
   * @throws {Error} Error: Item: <message>
   */
  static throwError(rawMessage: string) {
    throw new Error(`${this.name}: ${rawMessage}`)
  }

  /**
   * Throws no comparator error
   *
   * @static
   * @method throwNoComparator
   * @throws {Error} Error: Item: No item comparator has been set
   */
  static throwNoComparator(): null {
    this.throwError('No item comparator has been set')

    return null
  }

  /**
   * Throws no comparator error
   *
   * @static
   * @method throwNoItem
   * @param {string?} rawAction
   * @throws {Error} Error: Item: No item found
   * @throws {Error} Error: Item: No item found for copying
   * @throws {Error} Error: Item: No item found for deletion
   * @throws {Error} Error: Item: No item found for replacement
   */
  static throwNoItem(rawAction?: string): null {
    const actionString = rawAction ? ` for ${rawAction}` : ''

    this.throwError(`No item found${actionString}`)

    return null
  }

  /**
   * Copies one Item instance to another Item instance
   *
   * @static
   * @method copyItem
   * @param {Item|null} rawSrcItem
   * @param {Item|null} rawToItem
   * @returns {Item|null}
   */
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

/**
 * Function wrapper returns Item instance
 *
 * @function useItem
 * @param {*} rawValue
 * @returns {Item}
 */
function useItem<TValue = unknown>(rawValue: TItemDefaultValue<TValue>): Item<TValue> {
  return new Item<TValue>(rawValue)
}


/**
 * Item comparator result of item is less result
 *
 * @const {number} IS_LESS
 */
const IS_LESS = -1
/**
 * Item comparator result of item is equal result
 *
 * @const {number} IS_EQUAL
 */
const IS_EQUAL = 0
/**
 * Item comparator result of item is greater result
 *
 * @const {number} IS_GREATER
 */
const IS_GREATER = 1

/**
 * Default comparator can work with values and with
 * Item-like objects, comparing their .value props
 *
 * @function useDefaultItemComparator
 * @param {Item|*} rawA
 * @param {Item|*} rawB
 * @returns {number} -1 | 0 | 1
 */
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


/**
 * @class ItemComparator
 */
class ItemComparator {

  /**
   * Class name
   *
   * @static
   * @property {string} name
   */
  static name = 'ItemComparator'

  /**
   * Indicator of has comparator function been reversed or not
   *
   * @protected
   * @property {boolean} _isReversed
   */
  protected _isReversed: boolean

  /**
   * Saved external comparator function
   *
   * @protected
   * @property {Function|null} _externalComparator
   */
  protected _externalComparator: TItemDefaultComparator | null

  /**
   * Item comparator function
   *
   * @readonly
   * @property {Function} compare
   */
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

  /**
   * Public indicator of has comparator function been reversed or not
   *
   * @readonly
   * @property {boolean} isReversed
   */
  get isReversed(): boolean {
    return this._isReversed
  }

  /**
   * Checks if both values are equal
   *
   * @method isEqual
   * @param {Item|*} a
   * @param {Item|*} b
   * @returns {number} -1 | 0 | 1
   */
  isEqual(a: unknown, b: unknown): boolean {
    return this.compare(a, b) === IS_EQUAL
  }

  /**
   * Checks if first value is less than second
   *
   * @method isLess
   * @param {Item|*} a
   * @param {Item|*} b
   * @returns {number} -1 | 0 | 1
   */
  isLess(a: unknown, b: unknown): boolean {
    return this.compare(a, b) < IS_EQUAL
  }

  /**
   * Checks if first value is greater than second
   *
   * @method isGreater
   * @param {Item|*} a
   * @param {Item|*} b
   * @returns {number} -1 | 0 | 1
   */
  isGreater(a: unknown, b: unknown): boolean {
    return this.compare(a, b) > IS_EQUAL
  }

  /**
   * Checks if first value is less or equal than second
   *
   * @method isLessOrEqual
   * @param {Item|*} a
   * @param {Item|*} b
   * @returns {number} -1 | 0 | 1
   */
  isLessOrEqual(a: unknown, b: unknown): boolean {
    return this.isLess(a, b) || this.isEqual(a, b)
  }

  /**
   * Checks if first value is greater or equal than second
   *
   * @method isGreaterOrEqual
   * @param {Item|*} a
   * @param {Item|*} b
   * @returns {number} -1 | 0 | 1
   */
  isGreaterOrEqual(a: unknown, b: unknown): boolean {
    return this.isGreater(a, b) || this.isEqual(a, b)
  }

  /**
   * Sets (or resets) comparator function
   *
   * @protected
   * @method _setComparator
   * @param {Function?} externalComparator
   */
  protected _setComparator(externalComparator?: TItemDefaultComparator) {
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

  /**
   * Resets new comparator function
   *
   * @method resetComparator
   */
  resetComparator() {
    this._setComparator()
  }

  /**
   * Changes in places first and second arguments in comparator
   *
   * @method reverseComparator
   */
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

/**
 * Function wrapper returns Item instance
 *
 * @function useItemComparator
 * @param {Function?} externalComparator
 * @returns {ItemComparator}
 */
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
