import {
  ItemIsLess,
  ItemIsEqual,
  ItemIsGreater,
  ItemComparator,
  TItemDefaultComparator
} from "@/structures/Item";

interface ICalendarMonthOffsetsRes {
  lastDay: number
  firstDay: number
  daysInMonth: number
  daysOnScreen: number
}

interface IHolidayItem {
  isHoliday?: boolean
  date: number | string | Date
}

interface IHolidayItems {
  [id: string]: IHolidayItem
}

type THolidaysGetter = () => IHolidayItem[] | IHolidayItems | null

/**
 * Get Date object from milliseconds number, parsable string
 * or another Date object
 *
 * @function getDateFromValue
 * @param {number|string|Date} rawDate
 * @returns {Date}
 * @throws {Error} Error: getDateFromValue: Invalid date parsed from ${rawDate}
 */
function getDateFromValue(rawDate: number | string | Date): Date {
  const type = typeof rawDate
  let date: Date

  if (type === 'number') {
    date = new Date(rawDate)
  } else if (type === 'string') {
    date = new Date(Date.parse(rawDate as string))
  } else {
    date = new Date(rawDate) as Date
  }

  if (!checkIsDateValid(date)) {
    throw new Error(`getDateFromValue: Invalid date parsed from ${rawDate}`)
  }

  return date
}

/**
 * Returns number with a leading zero
 *
 * @function formatTimeunit
 * @param {number} rawNum
 * @returns {string}
 */
function formatTimeunit(rawNum: number): string {
  return ('0' + rawNum).slice(-2)
}

/**
 * Checks that given date isn't broken
 *
 * @function checkIsDateValid
 * @param {Date} rawDate
 * @returns {boolean}
 */
function checkIsDateValid(rawDate: number | Date): boolean {
  return !isNaN(rawDate.valueOf())
}

/**
 * Check if a given date is weekend
 *
 * @function checkIsWeekend
 * @param {Date} rawDate
 * @returns {boolean}
 */
function checkIsWeekend(rawDate: Date): boolean {
  const dayNum = rawDate.getDay()

  return dayNum === 0 || dayNum === 6
}

/**
 * An object with Maps of holidays
 *
 * @const {WeakMap} holidaysCache
 */
const holidaysCache = new WeakMap<THolidaysGetter, Map<string, boolean>>()

/**
 * Fill holidays dict with holidays list
 *
 * @function fillHolidaysCache
 * @param {Function} holidaysGetter the same function, which has been
 *   given as an argument to checkIsHoliday()
 * @returns {Map}
 */
function fillHolidaysCache(holidaysGetter: THolidaysGetter) {
  const rawHolidaysList = holidaysGetter()
  const holidaysList = new Map<string, boolean>()

  for (let key in rawHolidaysList) {
    const item = rawHolidaysList[key] as IHolidayItem
    let date = getDateFromValue(item.date)

    date.setHours(0)
    date.setMinutes(0)
    date.setSeconds(0)

    const dateKey = date.toString()

    holidaysList.set(
      dateKey,
      (item.isHoliday === true || item.isHoliday === undefined)
    )
  }

  holidaysCache.set(holidaysGetter, holidaysList)

  return holidaysList
}

/**
 * Remove holidays dict from cache
 *
 * @function clearHolidaysCache
 * @param {Function} holidaysGetter the same function, which has been
 *   given as an argument to checkIsHoliday()
 * @returns {boolean}
 */
function clearHolidaysCache(holidaysGetter: THolidaysGetter): boolean {
  return holidaysCache.delete(holidaysGetter)
}

/**
 * Check if a given date is a holiday
 *
 * Caches holidays dict, returning from holidaysGetter()
 * between the calls. Cache can be removed by
 * clearHolidaysCache() function
 *
 * @function checkIsHoliday
 * @param {number|string|Date} rawDate
 * @param {Function} holidaysGetter should return an array or an object:
 *   @object
 *     @property {boolean?} isHoliday true by default
 *       If set to false, even a weekend will be marked
 *       as a non-holiday
 *     @property {number|string|Date} date milliseconds,
 *       or string valid for Date.parse(), or Date instance
 * @returns {boolean}
 */
function checkIsHoliday(
  rawDate: number | string | Date,
  holidaysGetter: THolidaysGetter
): boolean {
  let holidaysList: Map<string, boolean> | undefined = holidaysCache.get(holidaysGetter)

  // Fill
  if (!holidaysList) {
    holidaysList = fillHolidaysCache(holidaysGetter)
  }

  const date = getDateFromValue(rawDate)

  date.setHours(0)
  date.setMinutes(0)
  date.setSeconds(0)

  const dateKey = date.toString()

  if (!holidaysList) {
    return checkIsWeekend(date)
  }

  const isHoliday = holidaysList.get(dateKey)

  if (isHoliday === undefined) {
    return checkIsWeekend(date)
  }

  return isHoliday
}

/**
 * Checks if a given year is leap or not
 *
 * @function checkIsYearLeap
 * @param {number|Date} rawDate
 * @returns {boolean}
 */
function checkIsYearLeap(rawDate: Date): boolean
function checkIsYearLeap(rawDate: number): boolean
function checkIsYearLeap(arg: unknown): boolean {
  const year = arg instanceof Date ? arg.getFullYear() : arg as number

  return new Date(year, 1, 29).getDate() === 29
}

/**
 * Gets number of days in year
 *
 * @function getDaysInYear
 * @param {number|Date} rawDate
 * @returns {number}
 */
function getDaysInYear(rawDate: Date): number
function getDaysInYear(rawDate: number): number
function getDaysInYear(arg: unknown): number {
  const year = arg instanceof Date ? arg.getFullYear() : arg as number

  return checkIsYearLeap(year) ? 366 : 365
}

/**
 * Gets number of days in month
 *
 * @function getDaysInMonth
 * @param {Date} rawDate
 * @returns {number}
 */
function getDaysInMonth(rawDate: Date): number {
  return new Date(
      rawDate.getFullYear(),
      rawDate.getMonth() + 1,
      0
    ).getDate()
}

/**
 * Get corrected number of weekday from monday (1)
 * till sunday (7)
 *
 * @function getCorrectedWeekday
 * @param {rawDate} rawDate
 * @returns {number}
 */
function getCorrectedWeekday(rawDate: Date): number {
  const weekDay = rawDate.getDay()

  return weekDay === 0 ? 7 : weekDay
}

/**
 * Default comparator can work with values and with
 * Item-like objects, comparing their .value props
 *
 * @function useDefaultItemComparator
 * @param {Date} dateA
 * @param {Date} dateB
 * @returns {number} -1 | 0 | 1
 */
const useDefaultDateComparator: TItemDefaultComparator = function(
  dateA: unknown,
  dateB: unknown
): number {
  const msA = (dateA as Date).getMilliseconds()
  const msB = (dateB as Date).getMilliseconds()

  if (dateA === dateB) {
    return ItemIsEqual
  }

  return msA < msB ? ItemIsLess : ItemIsGreater
}

class DateComparator extends ItemComparator {

  /**
   * Class name
   *
   * @static
   * @property {string} name
   */
  static name = 'DateComparator'

  /**
   * @constructor
   * @param {Function?} externalComparator
   */
  constructor(readonly externalComparator?: TItemDefaultComparator) {
    super(externalComparator ? externalComparator : useDefaultDateComparator)
  }

}

/**
 * Function wrapper returns DateComparator instance
 *
 * @function useDateComparator
 * @param {Function?} externalComparator
 * @returns {DateComparator}
 */
function useDateComparator(externalComparator?: TItemDefaultComparator): DateComparator {
  return new DateComparator(externalComparator)
}

export {
  DateComparator,
  useDateComparator,
  getDaysInYear,
  getDaysInMonth,
  formatTimeunit,
  checkIsHoliday,
  checkIsWeekend,
  checkIsYearLeap,
  checkIsDateValid,
  fillHolidaysCache,
  clearHolidaysCache,
  getCorrectedWeekday
}
