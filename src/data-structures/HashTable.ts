import type { TItemDefaultValue, TItemDefaultComparator } from '@/data-structures/Item'
import { LinkedList, useLinkedList } from '@/data-structures/LinkedList'
import type { LinkedListItem } from '@/data-structures/LinkedListItem'
import { type HashTableItem, useHashTableItem } from '@/data-structures/HashTableItem'

type THashParser<TKey extends string = string> = (keyString: TKey, tableLength?: number) => number

interface IHashTableObject<TValue, TKey extends string = string> {
  size: number
  keys: string[]
  items: { [id: string]: HashTableItem<TValue, TKey>[] }
}

const IS_LESS = -1
const IS_EQUAL = 0
const IS_GREATER = 1
const DEFAULT_SIZE = 32

export default class HashTable<TValue = unknown, TKey extends string = string> {

  static name = 'HashTable'

  protected _keys: { [id: string]: number }

  protected _table: LinkedList<HashTableItem<TValue, TKey>>[]

  protected _hashParser: THashParser<TKey>

  constructor(
    protected rawSize: number = DEFAULT_SIZE,
    protected rawHashParser?: THashParser<TKey>,
    protected rawItemComparator?: TItemDefaultComparator
  ) {
    let it0 = 0

    this._keys = { }
    this._table = [ ]

    while (it0 < rawSize) {
      this._table[it0] = useLinkedList<HashTableItem<TValue, TKey>>(
        rawItemComparator ? rawItemComparator : HashTable.itemComparator
      )

      it0 += 1
    }

    this._hashParser = typeof rawHashParser === 'function' ?
      rawHashParser :
      HashTable.hashParser
  }

  get sizeOf(): number {
    return this._table.length
  }

  static hashParser<TKey extends string = string>(rawKey: TKey, rawLen?: number): number {
    const len = rawLen !== undefined ? rawLen : DEFAULT_SIZE
    let sum = 0

    for (let it0 = 0; it0 < rawKey.length; it0++) {
      sum += rawKey[it0].charCodeAt(0)
    }

    return sum % len
  }

  static itemComparator<TValue, TKey extends string = string>(
    rawA: unknown,
    rawB: unknown
  ): number {
    const a = rawA as HashTableItem<TValue, TKey>
    const b = rawB as HashTableItem<TValue, TKey>

    if (a.value === b.value) {
      return IS_EQUAL
    }

    return a < b ? IS_LESS : IS_GREATER
  }

  parseHash(rawKey: TKey): number {
    return this._hashParser(rawKey, this._table.length)
  }

  getItem(rawKey: TKey): TItemDefaultValue<TValue> {
    const hash = this.parseHash(rawKey)
    const items = this._table[hash]
    const item = this._getItemValueByKey(items, rawKey)

    return item ? item.value : null
  }

  protected _getItemByKey(
    items: LinkedList<HashTableItem<TValue, TKey>>,
    rawKey: string
  ): LinkedListItem<HashTableItem<TValue, TKey>> | null {
    return items.findItem((item) => !!(item && item.key === rawKey))
  }

  protected _getItemValueByKey(
    items: LinkedList<HashTableItem<TValue, TKey>>,
    rawKey: string
  ): HashTableItem<TValue, TKey> | null {
    const found = this._getItemByKey(items, rawKey)

    return found ? (found!.value as HashTableItem<TValue, TKey>) : null
  }

  setItem(rawKey: TKey, value: TItemDefaultValue<TValue>) {
    const hash = this.parseHash(rawKey)
    const items = this._table[hash]
    const item = this._getItemByKey(items, rawKey)

    this._keys[rawKey] = hash

    if (!item) {
      items.appendItem(useHashTableItem(rawKey, value))
    } else {
      item.setValue(useHashTableItem(rawKey, value))
    }

    return this
  }

  deleteItem(rawKey: TKey): HashTableItem<TValue, TKey> | null {
    const hash = this.parseHash(rawKey)
    const items = this._table[hash]
    const rmItem = this._getItemByKey(items, rawKey)

    if (!items || !rmItem) {
      return null
    }

    delete this._keys[rawKey]

    const itemVal = items.deleteItem(rmItem.value)

    return itemVal ? (itemVal.value as HashTableItem<TValue, TKey>) : null
  }

  hasKey(rawKey: string): boolean {
    return Object.hasOwnProperty.call(this._keys, rawKey)
  }

  getKeys(): string[] {
    return Object.keys(this._keys)
  }

  getValues(): TItemDefaultValue<TValue>[] {
    const values: TItemDefaultValue<TValue>[] = [ ]

    for (let it0 = 0; it0 < this._table.length; it0++) {
      const items = this._table[it0].valueOf()
      const ln1 = items.length

      if (ln1) {
        for (let it1 = 0; it1 < ln1; it1++) {
          const item = items[it1]

          values.push(item!.value)
        }
      }
    }

    return values
  }

  valueOf(): IHashTableObject<TValue> {
    return this.toObject()
  }

  toObject(): IHashTableObject<TValue> {
    const res = { }

    for (let it0 = 0; it0 < this._table.length; it0++) {
      res[`${it0}`] = this._table[it0].valueOf()
    }

    return {
      size: this.sizeOf,
      keys: this.getKeys(),
      items: res
    }
  }

  toString(): string {
    return JSON.stringify(this.toObject())
  }

}

function useHashTable<TValue = unknown, TKey extends string = string>(
  rawSize: number = DEFAULT_SIZE,
  rawHashParser?: THashParser<TKey>,
  rawItemComparator?: TItemDefaultComparator
): HashTable<TValue, TKey> {
  return new HashTable<TValue, TKey>(rawSize, rawHashParser, rawItemComparator)
}

function useHashParser<TKey extends string = string>(rawKey: TKey, rawLen?: number): number {
  return HashTable.hashParser<TKey>(rawKey, rawLen)
}

export {
  THashParser,
  HashTable,
  useHashTable,
  useHashParser
}
