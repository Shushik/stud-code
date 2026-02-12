import { type TItemDefaultValue } from '@/structures/Item'
import { type Publisher, usePublisher } from '@/patterns/Publisher'

interface IReactiveItem<TValue> {
  value: TItemDefaultValue<TValue>
  on?: (listener: EventListener) => void
  off?: (listener: EventListener) => void
}

type TReactiveListener<TValue> = (
  newVal: TItemDefaultValue<TValue>,
  oldVal: TItemDefaultValue<TValue>
) => void

type TReactiveComputed<TValue> = (newVal: TItemDefaultValue<TValue>) => void

const UPDATE_EVENT = 'update:value'

function createListener<TValue = unknown>(rawListener: TReactiveListener<TValue>) {
  return (rawEvent: Event) => {
    const event = rawEvent as CustomEvent
    const { oldValue, newValue} = event.detail

    rawListener(newValue, oldValue)
  }
}

export function useWatch<TValue = unknown>(
  rawItem: IReactiveItem<TValue>,
  rawListener: TReactiveListener<TValue>
): void {
  rawItem.on && rawItem.on(createListener<TValue>(rawListener))
}

// export function useComputed<TValue = unknown>(
//   rawItem: IReactiveItem<TValue>,
//   rawListener: TReactiveComputed<TValue>
// ): IReactiveItem<TValue> {
//   const dispatcher = usePublisher<TValue>()
//   const listener = createListener<TValue>((newVal) => {
//     dispatcher.emit(UPDATE_EVENT, (newVal) => rawListener(newVal))
//   })
//
//   rawItem.on && rawItem.on(listener)
//
//   return {
//     get value(): TItemDefaultValue<TValue> {
//       return rawItem.value
//     }
//   }
// }

export function useReactive<TValue = unknown>(
  rawValue: TItemDefaultValue<TValue>
): IReactiveItem<TValue> {
  const dispatcher = usePublisher<TValue>()
  const item = useReactiveItem<TValue>(rawValue, dispatcher)

  return {
    get value(): TItemDefaultValue<TValue> {
      return item.value
    },
    set value(rawValue: TItemDefaultValue<TValue>) {
      item.value = rawValue
    },
    on: (listener: EventListener) => dispatcher.on(UPDATE_EVENT, listener),
    off: (listener: EventListener) => dispatcher.off(UPDATE_EVENT, listener)
  }
}

export function useReactiveItem<TValue = unknown>(
  rawValue: TItemDefaultValue<TValue>,
  dispatcher: Publisher
) {
  return new Proxy({ value: rawValue }, {
    get(target, key) {
      return target[key]
    },
    set(target, key, newValue: TItemDefaultValue<TValue>) {
      const oldValue = target[key]

      if (newValue === oldValue) {
        dispatcher!.emit(UPDATE_EVENT, { newValue, oldValue })
        return true
      }

      target[key] = newValue

      dispatcher!.emit(UPDATE_EVENT, { newValue, oldValue })

      return true
    }
  })
}
