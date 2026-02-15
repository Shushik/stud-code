import { phpDate } from '@/helpers/PHPDate'
import {
  getDaysInYear,
  getDaysInMonth,
  formatTimeunit,
  checkIsWeekend,
  checkIsYearLeap,
  checkIsDateValid
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

})
