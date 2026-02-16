/**
 * Reactive functions collection
 *
 * Was created for deeper understanding of Proxy based
 * reactivity pattern principles mostly
 *
 * @version 1.1
 * @author Shushik <silkleopard@yandex.ru>
 */
type TGetter<TValue = unknown> = () => TValue
type TProxied = WeakSet<WeakKey>
type TWatcher<TValue = unknown> = () => IListener<TValue>
type TListener = ((...args: unknown[]) => void) | null
type TListeners = Set<TListener | undefined>
type TObservers = Map<string, TListeners | undefined>
type TPrimitives = undefined | null | boolean | number | bigint | string | symbol

interface IListener<TValue = unknown> {
  observerKey?: string
  observers?: TObservers
  target: TValue
  listener: TListener
}

interface IComputed {
  listener: TListener
}

interface IRefTarget<TValue = unknown> {
  value: TValue
}

interface IRootTarget<TValue = unknown> {
  value: TValue | ITarget<TValue>
}

interface IComputedTarget<TValue = unknown> {
  value: TValue | ITarget<TValue>
}

interface ITarget<TValue = unknown> {
  [id: string]: TValue | ITarget<TValue>
}

/**
 * Active effect common object
 *
 * @var {Object} activeEffect
 */
let activeEffect: IListener | null = null

/**
 * Active computed common object
 *
 * @var {Object} activeComputed
 */
let activeComputed: IComputed | null = null

/**
 * Common observers key counter
 *
 * @var {number} observersKey
 */
let observersKey: number = 0

/**
 * Get observer ID for listeners lists
 *
 * @function getObserverKey
 * @returns {string}
 */
function getObserverKey(): string {
  observersKey += 1

  return `${observersKey}`
}

/**
 * Set changes listener to target object
 *
 * @function defineListener
 * @param {Map} observers
 * @param {string} observerKey
 */
function defineListener(observers: TObservers, observerKey: string) {
  let listeners: TListeners | undefined = observers.get(observerKey)
  const effectListener = activeEffect ? activeEffect.listener : null
  const computedListener = activeComputed ? activeComputed.listener : null

  // Create list of listeners for given key
  if (!listeners) {
    listeners = new Set()

    observers.set(observerKey, listeners)
  }

  // Set computed trigger listener
  if (computedListener) {
    listeners.add(computedListener)
  }

  // Set effect listener
  if (effectListener) {
    listeners.add(effectListener)

    activeEffect!.observers = observers
    activeEffect!.observerKey = observerKey
  }
}

function declineListener(observers: TObservers, observerKey: string, rawListener: TListener) {
  const listeners = observers.get(observerKey)

  if (!listeners) {
    return
  }

  listeners.delete(rawListener)
}

/**
 * Remove all existing listeners for the target object
 *
 * @function deleteListeners
 * @param {Map} observers
 * @param {string} observerKey
 */
function deleteListeners(observers: TObservers, observerKey: string) {
  if (observers.has(observerKey)) {
    observers.delete(observerKey)
  }
}

/**
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
 */
function triggerListeners<TValue = unknown>(
  observers: TObservers,
  observerKey: string,
  rootObserverKey: string,
  newVal: TValue,
  oldVal: TValue,
  rootVal?: IRootTarget<TValue>
) {
  // Call own object listeners
  if (observers.has(observerKey)) {
    observers.get(observerKey)!.forEach((listener) => (
      listener!(newVal, oldVal))
    )
  }

  // If target isn't root object, call root object
  // listeners too
  if (rootVal && observerKey !== rootObserverKey && observers.has(rootObserverKey)) {
    observers.get(rootObserverKey)!.forEach((listener) => (
      listener!(rootVal.value, rootVal.value
    )))
  }
}

/**
 * Create proxy wrapper for given object
 *
 * @function proxifyObject
 * @param {Object} rootVal
 * @param {Object} target
 * @param {Map} observers
 * @param {WeakSet} proxied
 * @param {string} rootObserverKey
 */
function proxifyObject<TValue = unknown>(
  rootVal: IRootTarget<TValue>,
  target: IRootTarget<TValue> | ITarget<TValue>,
  observers: TObservers,
  proxied: TProxied,
  rootObserverKey: string
) {
  // Observer key for object listeners
  const observerKey = getObserverKey()

  return new Proxy(target, {
    get(
      obj: ITarget<TValue> | IRootTarget<TValue>,
      key: string, rec
    ): TValue | ITarget<TValue> | IRootTarget<TValue> {
      let val = Reflect.get(obj, key, rec)

      // If internal property is object, it should be proxied
      if (typeof val === 'object' && val !== null && !proxied.has(target)) {
        // Proxify object
        val = proxifyObject<TValue>(
          rootVal,
          val,
          observers,
          proxied,
          rootObserverKey ? rootObserverKey : observerKey
        )

        // Remember proxied object for further checks
        proxied.add(target)

        // Save proxied object in a place of unproxied
        Reflect.set(obj, key, val, rec)
      }

      // If activeEffect or activeComputed listener is set,
      // it should be added to observers list
      if (activeComputed || (activeEffect && val === activeEffect.target)) {
        defineListener(observers, `${observerKey}.${key as string}`)
      }

      return val as unknown as TValue
    },
    set(
      obj: ITarget<TValue> | IRootTarget<TValue>,
      key: string,
      newVal: TValue,
      rec
    ): boolean {
      // Get an old value for comparison with the new one
      const oldVal = Reflect.get(obj, key, rec)
      // Save new value if it's not equal to an old one
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

      // Delete all listeners
      deleteListeners(observers, `${observerKey}.${key}`)

      return res
    }
  })
}

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
 * @returns {Function}
 */
function useWatch<TValue = unknown>(
  rawGetter: TGetter<TValue>,
  rawEffect: TListener
): TWatcher<TValue> {
  const target = rawGetter()
  const listener = rawEffect
  const effect = { target, listener }

  // Set current target and listener object from where
  // listener will be taken for the further subscription
  activeEffect = effect
  // Trigger value getter to run listener subscribe process
  rawGetter()
  // Reset current target and listener object
  activeEffect = null

  // Return a getter returns watcher object for further
  // usage in useUnwatch() function
  return () => effect
}

/**
 * Unwatchability for reactivity
 *
 * @function useUnwatch
 * @param {Function} rawWatcher getter returned from useWatch()
 */
function useUnwatch<TValue = unknown>(rawWatcher: TWatcher<TValue>) {
  // Get watcher object
  const watcher = rawWatcher()

  // No need to go further
  if (!watcher.observers || !watcher.observerKey) {
    return
  }

  // Remove listener
  declineListener(watcher.observers, watcher.observerKey, watcher.listener)
}

/**
 * Computing for reacting
 *
 * @function useComputed
 * @param {Function} rawGetter
 * @returns {Object}
 */
function useComputed<TValue = unknown>(rawGetter: TGetter<TValue>): IComputedTarget<TValue> {
  // Observer key for computed listeners
  const observerKey = getObserverKey()
  // Root observers list, where keys are like
  // '${object_id}' and values are listeners
  // functions
  const observers = new Map<string, TListeners>()
  let oldValue: TValue
  let newValue: TValue

  // Make subscription for changes in all reactive variables
  // of given expression
  activeComputed = {
    listener: (newVal, oldVal) => {
      if (newVal !== oldVal) {
        oldValue = newValue
        newValue = rawGetter()

        triggerListeners(observers, observerKey, observerKey, newValue, oldValue)
      }
    }
  }

  // Set default values and trigger value getter to run listener
  // subscribe process
  oldValue = rawGetter()
  newValue = oldValue

  // Reset subscription object
  activeComputed = null

  // Create outer computed structure
  return {
    get value() {
      // If some activeEffect is set, it should be added
      // to observers list
      if (activeEffect) {
        defineListener(observers, observerKey)
      }

      return newValue
    }
  }
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
  const proxied = new WeakSet<IRootTarget<TValue> | ITarget<TValue>>()
  // Root observers list, where keys are like
  // '${object_id}.${object_key}' and values are
  // listeners functions
  const observers = new Map<string, TListeners>()
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

export { useRef, useWatch, useUnwatch, useComputed, useReactive }
