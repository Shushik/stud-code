import { type TrieItem, TrieHeadCharacter, useTrieItem } from '@/data-structures/TrieItem'
import type {THashParser} from "@/data-structures/HashTable";

export default class Trie {

  static name = 'Trie'

  protected _headItem: TrieItem

  constructor(
    readonly rawHashSize?: number,
    readonly rawHashParser?: THashParser
  ) {
    this._headItem = useTrieItem(TrieHeadCharacter, false, rawHashSize, rawHashParser)
  }

  get headItem(): TrieItem | null {
    return this._headItem
  }

  setWord(rawWord: string) {
    const end = rawWord.length - 1
    let currItem: TrieItem = this._headItem

    for (let it0 = 0; it0 < rawWord.length; it0++) {
      const isCompleteWord = it0 === end

      currItem = currItem.setChild(rawWord[it0], isCompleteWord)
    }

    return this
  }

  protected _deleteWordDepth(
    rawWord: string,
    rawCurrItem: TrieItem | null,
    rawCharPos: number = 0
  ) {
    if (rawCharPos >= rawWord.length || !rawCurrItem) {
      return this
    }

    const char = rawWord[rawCharPos]
    const nextItem = rawCurrItem.getChild(char)

    if (nextItem === null) {
      return this
    }

    this._deleteWordDepth(rawWord, nextItem, rawCharPos + 1)

    if (rawCharPos === rawWord.length - 1) {
      nextItem.setIsCompleteWord(false)
    }

    rawCurrItem.deleteChild(char)

    return this
  }

  deleteWord(rawWord: string): Trie {
    return this._deleteWordDepth(rawWord, this._headItem)
  }

  suggestNextCharacters(rawWord: string): string[] | null {
    const lastChar = this.getLastCharacterItem(rawWord)

    if (!lastChar) {
      return null
    }

    return lastChar.suggestChildren()
  }

  hasWord(rawWord: string): boolean {
    const lastChar = this.getLastCharacterItem(rawWord)

    return !!lastChar && lastChar.isCompleteWord
  }

  getLastCharacterItem(rawWord: string): TrieItem | null {
    let currItem: TrieItem | null = this._headItem

    for (let it0 = 0; it0 < rawWord.length; it0++) {
      if (!currItem || !currItem.hasChild(rawWord[it0])) {
        return null
      }

      currItem = currItem.getChild(rawWord[it0])
    }

    return currItem
  }

}

function useTrie(rawHashSize?: number, rawHashParser?: THashParser): Trie {
  return new Trie(rawHashSize, rawHashParser)
}

export {
  Trie,
  useTrie
}
