import { type THashParser, type HashTable, useHashTable } from '@/structures/HashTable'
import { type TItemDefaultValue, Item } from '@/structures/Item'
import type { HashTableItem } from '@/structures/HashTableItem'

const HEAD_CHARACTER = '*'

export default class TrieItem extends Item<string> {

  static name = 'TrieItem'

  protected _isCompleteWord: boolean

  protected _children: HashTable<TrieItem>

  constructor(
    readonly rawChar: TItemDefaultValue<string>,
    readonly isComplete: boolean = false,
    readonly rawHashSize?: number,
    readonly rawHashParser?: THashParser
  ) {
    super(rawChar)

    this._isCompleteWord = isComplete
    this._children = useHashTable<TrieItem>(rawHashSize, rawHashParser)
  }

  get isCompleteWord(): boolean {
    return this._isCompleteWord
  }

  // set isCompleteWord(rawIsComplete: boolean) {
  //   this.setIsCompleteWord(rawIsComplete)
  // }

  get character(): TItemDefaultValue<string> {
    return this._value
  }

  // set character(rawChar: string) {
  //   this.setCharacter(rawChar)
  // }

  setCharacter(rawChar: TItemDefaultValue<string>) {
    this._value = rawChar
  }

  setIsCompleteWord(rawIsComplete: boolean) {
    this._isCompleteWord = rawIsComplete
  }

  getChild(rawChar: string): TrieItem | null {
    const item = this._children.getItem(rawChar)

    return item ? item : null
  }

  hasChild(rawChar: string): boolean {
    return this._children.hasKey(rawChar)
  }

  setChild(rawChar: string, rawIsComplete: boolean = false): TrieItem {
    let childItem = this._children.getItem(rawChar)

    if (!childItem) {
      childItem = useTrieItem(rawChar, rawIsComplete)

      this._children.setItem(rawChar, childItem)
    }

    childItem.setIsCompleteWord(rawIsComplete)

    return childItem
  }

  deleteChild(rawChar: string): TrieItem | null {
    const childItem = this.getChild(rawChar)
    let rmItem: HashTableItem<TrieItem> | null = null

    if (childItem && !childItem.isCompleteWord && !childItem.hasChildren()) {
      rmItem = this._children.deleteItem(rawChar)
    }

    return rmItem ? (rmItem.value as TrieItem | null) : null
  }

  hasChildren() {
    return this._children.getKeys().length > 0
  }

  suggestChildren(): string[] {
    return [...this._children.getKeys()] as string[]
  }

  // @ts-ignore Same property warning in inherited class? Really?
  valueOf(): string[] {
    return this.suggestChildren()
  }

  // @ts-ignore And this property isn't the same? Right?
  toString(): string {
    let children = this.suggestChildren().toString()

    children = children ? `:${children}` : ''

    return `${this.character}${this.isCompleteWord ? HEAD_CHARACTER : ''}${children}`
  }

}

function useTrieItem(
  rawChar: TItemDefaultValue<string>,
  isComplete: boolean = false,
  rawHashSize?: number,
  rawHashParser?: THashParser
): TrieItem {
  return new TrieItem(rawChar, isComplete, rawHashSize, rawHashParser)
}

export { HEAD_CHARACTER as TrieHeadCharacter, TrieItem, useTrieItem }
