const MS_IN_DAY = 86400000
const MS_IN_WEEK = MS_IN_DAY * 7

type TLetters = 'A' | 'D' | 'F' | 'G' | 'H' | 'L' | 'M' | 'N' | 'S' | 'U' | 'W' | 'Y' |
  'a' | 'd' | 'g' | 'h' | 'i' | 'j' | 'l' | 'm' | 'n' | 's' | 't' | 'w' | 'y' | 'z'
type TDatePart = (d: Date, t: TTranslator) => string | number
type TTranslator = (key: string) => string

/**
 * @function getDefaultLocale
 */
function getDefaultLocale(): string {
  return '' +
    'date.ampm.am:am;' +
    'date.ampm.pm:pm;' +
    'date.days.full.0:Sunday;' +
    'date.days.full.1:Monday;' +
    'date.days.full.2:Tuesday;' +
    'date.days.full.3:Wednesday;' +
    'date.days.full.4:Thursday;' +
    'date.days.full.5:Friday;' +
    'date.days.full.6:Saturday;' +
    'date.days.part.0:Sun;' +
    'date.days.part.1:Mon;' +
    'date.days.part.2:Tue;' +
    'date.days.part.3:Wen;' +
    'date.days.part.4:Thu;' +
    'date.days.part.5:Fri;' +
    'date.days.part.6:Sat;' +
    'date.parts.0:Night;' +
    'date.parts.1:Morning;' +
    'date.parts.2:Day;' +
    'date.parts.3:Evening;' +
    'date.months.decl.0:of January;' +
    'date.months.decl.1:of February;' +
    'date.months.decl.2:of March;' +
    'date.months.decl.3:of April;' +
    'date.months.decl.4:of May;' +
    'date.months.decl.5:of June;' +
    'date.months.decl.6:of July;' +
    'date.months.decl.7:of August;' +
    'date.months.decl.8:of September;' +
    'date.months.decl.9:of October;' +
    'date.months.decl.10:of November;' +
    'date.months.decl.11:of December;' +
    'date.months.full.0:January;' +
    'date.months.full.1:February;' +
    'date.months.full.2:March;' +
    'date.months.full.3:April;' +
    'date.months.full.4:May;' +
    'date.months.full.5:June;' +
    'date.months.full.6:July;' +
    'date.months.full.7:August;' +
    'date.months.full.8:September;' +
    'date.months.full.9:October;' +
    'date.months.full.10:November;' +
    'date.months.full.11:December;' +
    'date.months.part.0:Jan;' +
    'date.months.part.1:Feb;' +
    'date.months.part.2:Mar;' +
    'date.months.part.3:Apr;' +
    'date.months.part.4:May;' +
    'date.months.part.5:Jun;' +
    'date.months.part.6:Jul;' +
    'date.months.part.7:Aug;' +
    'date.months.part.8:Sep;' +
    'date.months.part.9:Oct;' +
    'date.months.part.10:Nov;' +
    'date.months.part.11:Dec;'
}

/**
 * @function getDefaultTranslate
 * @param {string} key
 * @returns {string}
 */
function getDefaultTranslate(key: string): string {
  const locale = getDefaultLocale()
  const longestLength = 12
  const separatorLength = 1
  let begPos = locale.indexOf(key)
  let endPos: number
  let slice: string
  const eof = ';'

  if (begPos === -1) {
    return key
  }

  begPos = begPos + key.length + separatorLength
  endPos = begPos + longestLength

  slice = locale.substring(begPos, endPos)
  endPos = slice.indexOf(eof)

  if (endPos === -1) {
    return key
  }

  return slice.substring(0, endPos)
}

/**
 * Short alias for getDefaultTranslate
 *
 * @const dt
 */
const dt = getDefaultTranslate

function getDateParts(): { [id: string ]: TDatePart }  {
  // Dates part dictionary where key is a letter and value
  // is a counting function
  return {
    // Uppercase Ante meridiem and Post meridiem
    A: (rd, t) => (t(`date.ampm.${rd.getHours() >= 12 ? 'pm' : 'am'}`)).toUpperCase(),
    // Textual representation of a day, three letters
    D: (rd, t) => t(`date.days.part.${rd.getDay()}`),
    // A full textual representation of a month, such as January or March
    F: (rd, t) => t(`date.months.full.${rd.getMonth()}`),
    // 24-hour format of an hour without leading zeros
    G: (rd, t) => rd.getHours(),
    // 24-hour format of an hour with leading zeros
    H: (rd, t) => formatTimeunit(rd.getHours()),
    // Whether it's a leap year
    L: (rd, t) => (
      new Date(rd.getFullYear(), 1, 29).
        getDate() != 1 ? 1 : 0
    ),
    // A short textual representation of a month, two or three letters (Jan – Dec)
    M: (rd, t) => t(`date.months.part.${rd.getMonth()}`),
    // Numeric representation of the day of the week (mon–sun)
    N: (rd, t) => {const d = rd.getDay(); return (d === 0 ? 7 : d)},
    // Declinated full month name (of January – of December)
    S: (rd, t) => t(`date.months.decl.${rd.getMonth()}`),
    // Seconds since the Unix Epoch
    U: (rd, t) => rd.getTime(),
    // ISO 8601 week number of year, weeks starting on Monday
    W: (rd, t) => Math.ceil(
      (rd.getTime() -
      (new Date(rd.getFullYear(), 0, 1, 0, 0, 0)).getTime()) /
      MS_IN_WEEK
    ),
    // Full numeric representation of a year,
    Y: (rd, t) => rd.getFullYear(),
    // O: (rd, t) => (this as Dictionary<(r: Date) => number | string>).Z(rd),
    // Timezone offset in seconds
    Z: (rd, t) => rd.getTimezoneOffset() * 60,
    // Lowercase Ante meridiem and Post meridiem
    a: (rd, t) => t(`date.ampm.${rd.getHours() >= 12 ? 'pm' : 'am'}`),
    // Day of the month, 2 digits with leading zeros
    d: (rd, t) => formatTimeunit(rd.getDate()),
    // 12-hour format of an hour without leading zeros
    g: (rd, t) => {
      const n = rd.getHours();
      return n >= 12 ? n - 12 : n
    },
    // 12-hour format of an hour with leading zeros
    h: (rd, t) => {
      const n = rd.getHours();
      return formatTimeunit(n >= 12 ? n - 12 : n)
    },
    // Minutes with leading zeros
    i: (rd, t) => formatTimeunit(rd.getMinutes()),
    // Day of the month without leading zeros
    j: (rd, t) => rd.getDate(),
    // Full textual representation of the day of the week
    l: (rd, t) => t(`date.days.full.${rd.getDay()}`),
    // Numeric representation of a month, with leading zeros
    m: (rd, t) => formatTimeunit(rd.getMonth() + 1),
    // Numeric representation of a month, without leading zeros
    n: (rd, t) => rd.getMonth() + 1,
    // Seconds with leading zeros
    s: (rd, t) => formatTimeunit(rd.getSeconds()),
    // Number of days in the given month
    t: (rd, t) => (
      new Date(rd.getFullYear(), rd.getMonth() + 1, 0).getDate()
    ),
    // Numeric representation of the day of the week (sun–mon)
    w: (rd, t) => rd.getDay(),
    // Two digit representation of a year
    y: (rd, t) => (`${rd.getFullYear()}`.substring(2)),
    // The day of the year (starting from 0)
    z: (rd, t) => Math.ceil((rd.getTime() - (
      new Date(rd.getFullYear(), 0, 1, 0, 0, 0)).getTime()) /
      MS_IN_DAY
    )
  }
}

/**
 * Gets formatted date like date() function in php
 * List of available formats see in the link
 *
 * If the second argument hasn't specified, uses current date/time
 *
 * The third param specifies translation functions (like i18n.t)
 * List of known keys can be seen in getDefaultLocale() function
 * Note that usually locales are stored in JSON or object
 *
 * @see https://www.php.net/manual/en/function.date.php
 *
 * @function phpDate
 * @param {string} tmpl
 * @param {Date?} rawDate
 * @param {Object?} rawTranslator
 * @returns {string}
 */
export default function phpDate(tmpl: string, rawDate?: Date, rawTranslator?: TTranslator): string {
  // No need to go further
  if (tmpl === '') {
    return tmpl
  }

  // Get translator function
  const t = rawTranslator ? rawTranslator : dt
  // Get date from argument or a new one
  const now = rawDate instanceof Date ? rawDate : new Date()
  // Get date parts
  const parts = getDateParts()
  // Result string
  let res = ''

  // Iterate template string backwards replacing known
  // symbols with the counted values
  for (let it0 = tmpl.length - 1; it0 > -1; it0--) {
    const sym = tmpl[it0]
    const func = parts[sym]

    res = `${func ? func(now, t) : sym}${res}`
  }

  return res
}

function formatTimeunit(raw: number): string {
  return ('0' + raw).slice(-2)
}

function checkIsYearLeap(year: number): boolean {
  return new Date(year, 1, 29).getDate() === 29
}

function getDaysInYear(year: number): number {
  return checkIsYearLeap(year) ? 366 : 365
}

export {
  phpDate,
  getDaysInYear,
  formatTimeunit,
  checkIsYearLeap
}
