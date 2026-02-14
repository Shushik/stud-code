import {
  phpDate,
  helpGetDaysInYear,
  helpFormatTimeunit,
  helpCheckIsYearLeap
} from '@/helpers/PHPDate'

describe('PHPDate and date helpers', () => {

  it('Should return number with leading zero', () => {
    expect(helpFormatTimeunit(1)).toBe('01')
  })

  it('Should correctly count leapYear and days in year', () => {
    const leapYear = 2000
    const daysInLeapYear = 366
    const nonLeapYear = 1983
    const daysInNonLeapYear = 365

    expect(helpCheckIsYearLeap(leapYear)).toBeTruthy()
    expect(helpGetDaysInYear(leapYear)).toBe(daysInLeapYear)
    expect(helpCheckIsYearLeap(nonLeapYear)).toBeFalsy()
    expect(helpGetDaysInYear(nonLeapYear)).toBe(daysInNonLeapYear)
  })

  it('Should correctly format date', () => {
    const now = new Date(1938, 1, 16, 0, 0, 0)
    const Y = now.getFullYear()
    const m = helpFormatTimeunit(now.getMonth() + 1)
    const d = helpFormatTimeunit(now.getDate())
    const H = helpFormatTimeunit(now.getHours())
    const i = helpFormatTimeunit(now.getMinutes())
    const s = helpFormatTimeunit(now.getSeconds())

    // Using known symbols
    expect(phpDate('Y-m-d H:i:s', now)).toBe(`${Y}-${m}-${d} ${H}:${i}:${s}`)
    // Using unknown symbols
    expect(phpDate('O')).toBe('O')
  })

})
