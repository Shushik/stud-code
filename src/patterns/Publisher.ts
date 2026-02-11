export default class Publisher<TData = unknown> {

  static name = 'Publisher'

  protected _dispatcher: EventTarget

  constructor() {
    this._dispatcher = new EventTarget()
  }

  on(rawType: string, rawListener: EventListener | EventListenerObject) {
    this._dispatcher.addEventListener(rawType, rawListener)
  }

  off(rawType: string, rawListener: EventListener | EventListenerObject) {
    this._dispatcher.removeEventListener(rawType, rawListener)
  }

  emit(rawType: string, rawData: TData, rawOptions?: CustomEvent) {
    const event = new CustomEvent(rawType, {
      bubbles: true,
      cancelable: true,
      type: rawType,
      target: null,
      ...rawOptions,
      detail: rawData
    })

    this._dispatcher.dispatchEvent(event)
  }

}

function usePublisher<TData = unknown>(): Publisher {
  return new Publisher<TData>()
}


type TCallback = (...args: unknown[]) => unknown

class OldPublisher {

  static name = 'OldPublisher'

  protected _events: { [id: string]: TCallback[] }

  constructor() {
    this._events = { }
  }

  on(rawEvent: string, rawCallback: TCallback) {
    if (!this._events[rawEvent]) {
      this._events[rawEvent] = [ ] as TCallback[]
    }

    this._events[rawEvent].push(rawCallback)
  }

  off(rawEvent: string, rawCallback?: TCallback) {
    if (!this._events[rawEvent]) {
      return
    }

    if (!rawCallback) {
      delete this._events[rawEvent]
    }

    this._events[rawEvent] = this._events[rawEvent].filter(
      (callback) => callback !== rawCallback
    )
  }

  emit(rawEvent: string, ...args: unknown[]) {
    if (!this._events[rawEvent]) {
      return
    }

    this._events[rawEvent].forEach(
      (eventHandler) => eventHandler(...args)
    )
  }

}

function useOldPublisher(): OldPublisher {
  return new OldPublisher()
}

export { Publisher, OldPublisher, usePublisher, useOldPublisher }
