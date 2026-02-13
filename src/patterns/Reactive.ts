/*
 * Reactive functions collection
 *
 * Was created for deeper understanding of Proxy based
 * reactivity pattern principles mostly
 *
 * @version 1.1
 * @author Shushik <silkleopard@yandex.ru>
**/
type TGetter<TValue = unknown> = () => TValue
type TListener = ((...args: unknown[]) => void) | null
type TProxied = WeakSet<WeakKey>
type TListeners = Set<TListener | undefined>
type TObservers = Map<string, TListeners | undefined>
type TPrimitives = undefined | null | boolean | number | bigint | string | symbol

interface IListener<TValue = unknown> {
  target: TValue
  listener: TListener
}

interface IRefTarget<TValue = unknown> {
  value: TValue
}

interface IRootTarget<TValue = unknown> {
  value: TValue | ITarget<TValue>
}

interface ITarget<TValue = unknown> {
  [id: string]: TValue | ITarget<TValue>
}

// Active effect common object
let activeEffect: IListener | null = null
// Common observers key counter
let observersKey: number = 0

/*
 * Set changes listener to target object
 *
 * @function defineListener
 * @param {Map} observers
 * @param {string} observerKey
 * @listener {Function} listener
**/
function defineListener(observers: TObservers, observerKey: string, listener: TListener) {
  let listeners: TListeners | undefined = observers.get(observerKey)

  // Create list of listeners for given key
  if (!listeners) {
    listeners = new Set()

    observers.set(observerKey, listeners)
  }

  // Set listener
  listeners.add(listener)
}

/*
 * Run all existing listeners both for the target object
 * and the root object changes
 *
 * @function triggerListeners
 * @param {Map} observers
 * @param {string} observerKey
 * @param {string} rootObserverKey
 * @param {undefined|null|boolean|number|bigint|string|symbol|Object} newVal
 * @param {undefined|null|boolean|number|bigint|string|symbol|Object} oldVal
 * @param {Object} rootVal
**/
function triggerListeners<TValue = unknown>(
  observers: TObservers,
  observerKey: string,
  rootObserverKey: string,
  newVal: TValue,
  oldVal: TValue,
  rootVal: IRootTarget<TValue>
) {
  // Call own object listeners
  if (observers.has(observerKey)) {
    observers.get(observerKey)!.forEach((listener) => listener!(newVal, oldVal))
  }

  // If target isn't root object, call root object
  // listeners too
  if (observerKey !== rootObserverKey && observers.has(rootObserverKey)) {
    observers.get(rootObserverKey)!.forEach((listener) => listener!(rootVal.value, rootVal.value))
  }
}

/*
 * Create proxy wrapper for given object
 *
 * @function proxifyObject
 * @param {Object} rootVal
 * @param {Object} target
 * @param {Map} observers
 * @param {WeakSet} proxied
 * @param {string} rootObserverKey
**/
function proxifyObject<TValue = unknown>(
  rootVal: IRootTarget<TValue>,
  target: IRootTarget<TValue> | ITarget<TValue>,
  observers: TObservers,
  proxied: TProxied,
  rootObserverKey: string
) {
  const observerKey = `${observersKey}`

  observersKey += 1

  return new Proxy(target, {
    get(
      obj: ITarget<TValue> | IRootTarget<TValue>,
      key: string, rec
    ): TValue | ITarget<TValue> | IRootTarget<TValue> {
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
        defineListener(observers, `${observerKey}.${key as string}`, activeEffect.listener)
      }

      return val as unknown as TValue
    },
    set(
      obj: ITarget<TValue> | IRootTarget<TValue>,
      key: string,
      newVal: TValue,
      rec
    ): boolean {
      const oldVal = Reflect.get(obj, key, rec)
      const res = newVal !== oldVal ? Reflect.set(obj, key, newVal) : true

      // Try to trigger listeners from observers list
      triggerListeners<TValue>(
        observers,
        `${observerKey}.${key}`,
        `${rootObserverKey}.value`,
        newVal,
        oldVal,
        rootVal
      )

      return res
    },
    deleteProperty(
      obj: ITarget<TValue> | IRootTarget<TValue>,
      key: string
    ): boolean {
      const oldVal = Reflect.get(obj, key)
      const res = Reflect.deleteProperty(obj, key)

      // Try to trigger listeners from observers list
      triggerListeners<TValue | undefined>(
        observers,
        `${observerKey}.${key}`,
        `${rootObserverKey}.value`,
        undefined,
        oldVal,
        rootVal
      )

      return res
    }
  })
}

/**
 * @todo: useComputed()
 */

/**
 * Reactivity for primitivity
 *
 * @function useRef
 * @param {undefined|null|boolean|number|bigint|string|symbol} rawValue
 * @returns {Object}
 */
function useRef<TValue extends TPrimitives>(rawValue: TValue): IRefTarget<TValue> {
  return useReactive<TValue>(rawValue) as unknown as IRefTarget<TValue>
}

/**
 * Watchability for reactivity
 *
 * @function useWatch
 * @param {Function} rawGetter
 * @param {Function} rawEffect
 */
function useWatch<TValue = unknown>(rawGetter: TGetter<TValue>, rawEffect: TListener) {
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

/**
 * Reactivity for objectivity
 *
 * @function useReactive
 * @param {undefined|null|boolean|number|bigint|string|symbol|Object} rawValue
 * @returns {Object}
 */
function useReactive<TValue = unknown>(rawValue: TValue): IRootTarget<TValue> {
  // proxied variable needed to check if object have been
  // proxied or not
  const proxied = new WeakSet()
  // Root observers list, where keys are like
  // '${object_id}.${object_key}' and values are
  // listeners functions
  const observers = new Map()
  // Root object
  const target: IRootTarget<TValue> = { value: rawValue }

  // Let it begin
  return proxifyObject<TValue>(
    target,
    target,
    observers,
    proxied,
    ''
  ) as IRootTarget<TValue>
}

export { useRef, useWatch, useReactive }
