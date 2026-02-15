import { vi } from 'vitest'
import { phpDate } from '@/helpers/PHPDate'
import {
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
} from '@/helpers/Date'

describe('PHPDate and date helpers', () => {

  it('Should return number with leading zero', () => {
    expect(formatTimeunit(1)).toBe('01')
  })

  it('Should correctly count leapYear and days in year', () => {
    const leapYear = 2000
    const daysInLeapYear = 366
    const nonLeapYear = 1983
    const daysInNonLeapYear = 365

    expect(checkIsYearLeap(leapYear)).toBeTruthy()
    expect(getDaysInYear(leapYear)).toBe(daysInLeapYear)
    expect(checkIsYearLeap(nonLeapYear)).toBeFalsy()
    expect(getDaysInYear(nonLeapYear)).toBe(daysInNonLeapYear)
  })

  it('Should check if given date is valid or not', () => {
    const validDate = new Date()
    const invalidDate = Date.parse('oh no')

    expect(checkIsDateValid(validDate)).toBeTruthy()
    expect(checkIsDateValid(invalidDate)).toBeFalsy()
  })

  it('Should check if given date is weekend or not', () => {
    const wednesday = checkIsWeekend(new Date(1983, 1, 16))
    const saturday = checkIsWeekend(new Date(2016, 2, 5))

    expect(wednesday).toBeFalsy()
    expect(saturday).toBeTruthy()
  })

  it('Should get correct days in month', () => {
    const feb28 = getDaysInMonth(new Date(1983, 1, 16))
    const feb29 = getDaysInMonth(new Date(2000, 1, 16))

    expect(feb28).toBe(28)
    expect(feb29).toBe(29)
  })

  it('Get corrected week day number', () => {
    const wednesday = new Date(1983, 1, 16, 10, 0, 0)
    const saturday = new Date(1983, 1, 19, 10, 0, 0)
    const sunday = new Date(1983, 1, 20, 10, 0, 0)

    expect(getCorrectedWeekday(wednesday)).toBe(3)
    expect(getCorrectedWeekday(saturday)).toBe(6)
    expect(getCorrectedWeekday(sunday)).toBe(7)
  })

  it('Should correctly format date', () => {
    const now = new Date(1938, 1, 16, 0, 0, 0)
    const Y = now.getFullYear()
    const m = formatTimeunit(now.getMonth() + 1)
    const d = formatTimeunit(now.getDate())
    const H = formatTimeunit(now.getHours())
    const i = formatTimeunit(now.getMinutes())
    const s = formatTimeunit(now.getSeconds())
    const ampm = 'AM'
    const wday = 'Wen'
    const month = 'Feb'

    // Using known symbols
    expect(phpDate('Y-m-d H:i:s', now)).toBe(`${Y}-${m}-${d} ${H}:${i}:${s}`)
    // Using unknown symbols
    expect(phpDate('O', now)).toBe('O')
    // Testing literals
    expect(phpDate('AMD', now)).toBe(`${ampm}${month}${wday}`)
  })

  it('Should check if given date is holiday or not', () => {
    const holiday1 = '1983-01-01T10:00:00'
    const holiday2 = 410338800000
    const notHoliday1 = new Date(1983, 0, 3, 10, 0, 0)
    const notHoliday2 = new Date(1983, 1, 16, 10, 0, 0)
    const firstJan = {
      isHoliday: true,
      date: holiday1
    }
    const secondJan = {
      date: holiday2
    }
    const thirdJan = {
      isHoliday: false,
      date: notHoliday1
    }
    const holidaysArr = vi.fn(() => [
      firstJan,
      secondJan,
      thirdJan
    ])
    const holidaysObj = vi.fn(() => ({
      firstJan,
      secondJan,
      thirdJan
    }))
    const holidayDir = vi.fn(() => [
      {
        isHoliday: true,
        date: notHoliday2
      }
    ])

    // Check with array and object
    expect(checkIsHoliday(holiday1, holidaysArr)).toBeTruthy()
    expect(checkIsHoliday(holiday2, holidaysArr)).toBeTruthy()
    expect(checkIsHoliday(notHoliday1, holidaysObj)).toBeFalsy()
    expect(checkIsHoliday(notHoliday2, holidaysObj)).toBeFalsy()
    expect(holidaysArr).toHaveBeenCalledTimes(1)
    expect(holidaysObj).toHaveBeenCalledTimes(1)

    // Reset holidays cache (getter calls should iterate)
    clearHolidaysCache(holidaysArr)
    clearHolidaysCache(holidaysObj)

    expect(checkIsHoliday(holiday1, holidaysArr)).toBeTruthy()
    expect(checkIsHoliday(holiday2, holidaysArr)).toBeTruthy()
    expect(checkIsHoliday(notHoliday1, holidaysObj)).toBeFalsy()
    expect(checkIsHoliday(notHoliday2, holidaysObj)).toBeFalsy()
    expect(holidaysArr).toHaveBeenCalledTimes(2)
    expect(holidaysObj).toHaveBeenCalledTimes(2)

    // Reset holidays directly
    clearHolidaysCache(holidaysArr)
    clearHolidaysCache(holidaysObj)

    // You can just choose a day, you know
    fillHolidaysCache(holidayDir)

    expect(checkIsHoliday(notHoliday2, holidayDir)).toBeTruthy()
    expect(holidayDir).toHaveBeenCalledTimes(1)
  })

})
