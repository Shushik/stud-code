import { configDotenv } from 'dotenv'
import { Trie, useTrie } from '@/data-structures/Trie'
import { TrieHeadCharacter } from '@/data-structures/TrieItem'

configDotenv({
  quiet: true,
  path: `.env.${process.env.NODE_ENV}`
})

const WORDS = [
  `Don't`, 'come', 'easy', 'to', 'me',
]

describe(`${Trie.name}`, () => {

  it(`Should create proper instance of ${Trie.name}`, () => {
    const trie = useTrie()
    let word = WORDS[0]

    expect(trie.headItem!.character).toBe(TrieHeadCharacter)
    expect(trie.hasWord(word)).toBeFalsy()

    // Add some words
    WORDS.forEach((word) => trie.setWord(word))

    word = WORDS[1]
    const char = word[0]

    expect(trie.headItem!.hasChildren()).toBeTruthy()
    expect(trie.hasWord(word)).toBeTruthy()

    const child = trie.headItem!.getChild(char)
    const lastItem = trie.getLastCharacterItem(word)!

    expect(child!.character).toBe(char)
    expect(child!.isCompleteWord).toBeFalsy()
    expect(lastItem).not.toBeNull()
    expect(lastItem.character).toBe(word[word.length - 1])
    expect(lastItem.isCompleteWord).toBeTruthy()

    // Delete items
    word = WORDS[2]

    trie.deleteWord(word)

    expect(trie.hasWord(word)).toBeFalsy()
    expect(trie.getLastCharacterItem(word)).toBeNull()

    WORDS.forEach((word) => trie.deleteWord(word))

    word = WORDS[0]

    expect(trie.hasWord(word)).toBeFalsy()
    expect(trie.headItem!.hasChildren()).toBeFalsy()
  })

})
