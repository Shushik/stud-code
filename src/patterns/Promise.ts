import { type TTimerId, setTimer } from '@/helpers/Timer'

export type TMyPromiseExecHandler = (resolve: TMyPromiseThenHandler, reject: TMyPromiseCatchHandler) => unknown
type TMyPromiseThenHandler = (value?: unknown) => void
type TMyPromiseCatchHandler = (reason?: unknown) => void

export default class MyPromise<TValue = unknown> {

  static name = 'MyPromise'

  protected _isRejected = false

  protected _isResolved = false

  protected _timerId: TTimerId = null

  protected _thenHandlers: TMyPromiseThenHandler[] = []

  protected _catchHandlers: TMyPromiseCatchHandler[] = []

  constructor(protected execHandler: TMyPromiseExecHandler) {
    this._isRejected = false
    this._isResolved = false
    this._thenHandlers = [ ]
    this._catchHandlers = [ ]

    this._runThens = this._runThens.bind(this)
    this._runCatches = this._runCatches.bind(this)

    this._timerId = setTimer(() => execHandler(this._runThens, this._runCatches), 0)
  }

  get isRejected(): boolean {
    return this._isRejected
  }

  get isResolved(): boolean {
    return this._isResolved
  }

  protected _runThens() {
    this._isResolved = true

    this._thenHandlers.forEach((handler: TMyPromiseThenHandler) => handler())
  }

  protected _runCatches() {
    this._isRejected = true

    this._catchHandlers.forEach((handler: TMyPromiseCatchHandler) => handler())
  }

  then(handler: TMyPromiseThenHandler) {
    if (this._isResolved) {
      handler()
    } else {
      this._thenHandlers.push(handler)
    }

    return this
  }

  catch(handler: TMyPromiseCatchHandler) {
    if (this._isRejected) {
      handler()
    } else {
      this._catchHandlers.push(handler)
    }

    return this
  }

  static all<TValue = unknown>(
    promisesList: MyPromise<TValue>[],
    successCallback: TMyPromiseThenHandler,
    failureCallback: TMyPromiseCatchHandler
  ): MyPromise<TValue[]> {
    return new MyPromise<TValue>((resolve, reject) => {
      let resolvedCount = 0
      const results: TValue[] = [ ]

      promisesList.forEach((promise: MyPromise<TValue>, pos) => (
        promise.then((res: unknown) => {
          results[pos] = res as TValue
          resolvedCount += 1

          if (resolvedCount === promisesList.length) {
            resolve(results)
          }
        }).catch((err: unknown) => { reject(err) })
      ))
    }).then(successCallback).catch(failureCallback)
  }

  static reject<TValue = unknown>(promise: MyPromise<TValue>) {
    return promise._runCatches()
  }

  static resolve<TValue = unknown>(promise: MyPromise<TValue>) {
    return promise._runThens()
  }

}

export { MyPromise }
