type TCallback = (...args: unknown[]) => unknown

export default class Publisher {

  static name = 'Publisher'

  protected _events: { [id: string]: TCallback[] }

  constructor() {
    this._events = { }
  }

  pub(rawEvent: string, ...args: unknown[]) {
    if (!this._events[rawEvent]) {
      return
    }

    this._events[rawEvent].forEach(
      (eventHandler) => eventHandler(...args)
    )
  }

  sub(rawEvent: string, rawCallback: TCallback) {
    if (!this._events[rawEvent]) {
      this._events[rawEvent] = [ ] as TCallback[]
    }

    this._events[rawEvent].push(rawCallback)
  }

  unsub(rawEvent: string, rawCallback?: TCallback) {
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

}

function usePublisher(): Publisher {
  return new Publisher()
}

export { Publisher, usePublisher }
