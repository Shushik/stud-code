import { TrieItem, useTrieItem } from '@/structures/TrieItem'

const CHAR_A = 'a'
const CHAR_B = 'b'
const CHAR_C = 'c'
const CHAR_X = 'x'

describe(`${TrieItem.name}`, () => {

  it(`Should create proper instance of ${TrieItem.name}`, () => {
    const trieRoot = useTrieItem(CHAR_A)

    expect(trieRoot.character).toBe(CHAR_A)
    expect(trieRoot.isCompleteWord).toBeFalsy()
    expect(trieRoot.hasChildren()).toBeFalsy()
    expect(trieRoot.toString()).toBe(`${CHAR_A}`)

    // Add some children
    trieRoot.setChild(CHAR_B)
    trieRoot.setChild(CHAR_C, true)

    expect(trieRoot.hasChildren()).toBeTruthy()
    expect(trieRoot.hasChild(CHAR_B)).toBeTruthy()
    expect(trieRoot.hasChild(CHAR_C)).toBeTruthy()

    // Get some children info
    const bChild = trieRoot.getChild(CHAR_B)
    const cChild = trieRoot.getChild(CHAR_C)

    expect(bChild!.character).toBe(CHAR_B)
    expect(trieRoot.getChild(CHAR_A)).toBeNull()
    expect(cChild!.character).toBe(CHAR_C)
    expect(cChild!.isCompleteWord).toBeTruthy()

    // Delete child only if it has no children and
    // it doesn't have complete word flag
    cChild!.setChild(CHAR_X)

    trieRoot.deleteChild(CHAR_B)
    trieRoot.deleteChild(CHAR_C)

    expect(trieRoot.hasChild(CHAR_B)).toBeFalsy()
    expect(trieRoot.hasChild(CHAR_C)).toBeTruthy()

    cChild!.deleteChild(CHAR_X)
    trieRoot.deleteChild(CHAR_C)

    expect(trieRoot.hasChild(CHAR_C)).toBeTruthy()

    cChild!.setIsCompleteWord(false)
    trieRoot.deleteChild(CHAR_C)

    expect(trieRoot.hasChildren()).toBeFalsy()
  })

})
