import {
  phpDate,
  getDaysInYear,
  formatTimeunit,
  checkIsYearLeap
} from '@/helpers/PHPDate'

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
