import {
  HashTable,
  useHashTable,
  useHashParser
} from '@/structures/HashTable'

const TABLE_SIZE = 64
const KEY_ONE = 'key_123'
const VAL_ONE = 'val_123'
const HASH_ONE = 62
const KEY_TWO = 'key_321'
const VAL_TWO = 'val_321'
const KEY_THREE = 'key_456'
const VAL_THREE = 'val_456'
const KEY_FAIL = 'key_789'

describe(`${HashTable.name}`, () => {

  it(`Should create proper instance of ${HashTable.name}`, () => {
    const hashTable = useHashTable<string>(TABLE_SIZE)
    const hashValue = hashTable.parseHash(KEY_ONE)

    expect(hashTable.sizeOf).toBe(TABLE_SIZE)
    expect(hashValue).toBe(HASH_ONE)
    expect(hashValue).toBe(useHashParser(KEY_ONE, hashTable.sizeOf))

    // Add some elements (with collisions)
    hashTable.setItem(KEY_ONE, VAL_ONE)
    hashTable.setItem(KEY_TWO, VAL_TWO)
    hashTable.setItem(KEY_THREE, VAL_THREE)

    expect(hashTable.getItem(KEY_ONE)).toBe(VAL_ONE)
    expect(hashTable.getItem(KEY_TWO)).toBe(VAL_TWO)
    expect(hashTable.hasKey(KEY_FAIL)).toBeFalsy()
    expect(hashTable.hasKey(KEY_THREE)).toBeTruthy()

    // Remove some elements
    const len = hashTable.getKeys().length

    hashTable.deleteItem(KEY_FAIL)

    expect(hashTable.getKeys().length).toBe(len)

    hashTable.deleteItem(KEY_ONE)

    expect(hashTable.hasKey(KEY_ONE)).toBeFalsy()
    expect(hashTable.getKeys().length).toBe(len - 1)
    expect(hashTable.getValues()).toEqual([ VAL_THREE, VAL_TWO ])
  })

})

