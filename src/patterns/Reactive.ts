type TEffect = ((...args: unknown[]) => void) | null
type TGetter<TValue = unknown> = () => TValue

interface IEffect<TValue = unknown> {
  target: TValue
  listener: TEffect
}

// Active effect common object
let activeEffect: IEffect | null = null
// Common observers key counter
let observersKey: number = 0

export function useWatch<TValue = unknown>(rawGetter: TGetter<TValue>, rawEffect: TEffect) {
  const target = rawGetter()
  const listener = rawEffect

  // Set current target and listener object from where
  // listener will be taken for the further subscription
  activeEffect = { target, listener }
  // Trigger value getter to run listener subscribe process
  rawGetter()
  // Reset current target and listener object
  activeEffect = null
}

function defineListeners(observers, observerKey, listener) {
    let listeners = observers.get(observerKey)

    // Create list of listeners for given key
    if (!listeners) {
      listeners = new Set()

      observers.set(observerKey, listeners)
    }

    listeners.add(listener)
}

function triggerListeners(
  observers,
  observerKey,
  rootObserverKey,
  newVal,
  oldVal,
  rootVal
) {
  // Call own object listeners
  if (observers.has(observerKey)) {
    observers.get(observerKey).forEach((listener) => listener(newVal, oldVal))
  }

  // If target isn't root object, call root object
  // listeners too
  if (observerKey !== rootObserverKey && observers.has(rootObserverKey)) {
    observers.get(rootObserverKey).forEach((listener) => listener(rootVal.value, rootVal.value))
  }
}

function proxifyObject<TValue = unknown>(rootVal, target, observers, proxied, rootObserverKey) {
  const observerKey = `${observersKey}`

  observersKey += 1

  return new Proxy(target, {
    get(obj, key: string, rec): TValue {
      let val = Reflect.get(obj, key, rec)

      // If internal property is object, it should be proxied
      if (typeof val === 'object' && val !== null && !proxied.has(target)) {
        val = proxifyObject<TValue>(
          rootVal,
          val,
          observers,
          proxied,
          rootObserverKey ? rootObserverKey : observerKey
        )

        proxied.add(target)

        Reflect.set(obj, key, val, rec)
      }

      // If some activeEffect is set, it should be added
      // to observers list
      if (activeEffect && val === activeEffect.target) {
        defineListeners(observers, `${observerKey}.${key as string}`, activeEffect.listener)
      }

      return val
    },
    set(obj, key, newVal, rec): boolean {
      const oldVal = Reflect.get(obj, key, rec)
      const res = newVal !== oldVal ? Reflect.set(obj, key, newVal) : true

      // Try to trigger listeners from observers list
      triggerListeners(
        observers,
        `${observerKey}.${key as string}`,
        `${rootObserverKey}.value`,
        newVal,
        oldVal,
        rootVal
      )

      return res
    }
  })
}

export function useReactive<TValue = unknown>(rawValue: TValue) {
  // proxied variable needed to check if object have been
  // proxied or not
  const proxied = new WeakSet()
  // Root observers list, where keys are like
  // '${object_id}.${object_key}' and values are
  // listeners functions
  const observers = new Map()
  // Root object
  const target: { value: TValue } = { value: rawValue }

  return proxifyObject<TValue>(target, target, observers, proxied, '')
}
