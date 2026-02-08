import { TItemDefaultValue, Item } from '@/structures/Item'

export default class HashTableItem<
  TValue = unknown,
  TKey extends string = string
> extends Item<TValue> {

  protected _key: TKey

  constructor(rawKey: TKey, rawValue: TItemDefaultValue<TValue>) {
    super(rawValue)

    this._key = rawKey
  }

  get key(): TKey {
    return this._key
  }

  // set key(rawKey: TKey) {
  //   this.setKey(rawKey)
  // }

  setKey(rawKey: TKey) {
    this._key = rawKey
  }

}

function useHashTableItem<
  TValue = unknown,
  TKey extends string = string
>(rawKey: TKey, rawValue: TItemDefaultValue<TValue>): HashTableItem<TValue, TKey> {
  return new HashTableItem<TValue, TKey>(rawKey, rawValue)
}

export {
  HashTableItem,
  useHashTableItem
}
