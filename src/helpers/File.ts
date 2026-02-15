export interface IFileSize {
  size: number
  bytes: number
  unit: string
}

/**
 * Format file size
 *
 * @function formatFileSize
 * @param {number} rawSize in bytes
 * @param {boolean?} si true for kilobytes, false for kibibytes
 * @param {number?} bp numbers after the decimal point
 * @return {Object}
 */
function formatFileSize(rawSize: number, si: boolean = false, bp: number = 1): IFileSize {
  const step = Math.pow(10, bp)
  const unit = si ? 1024 : 1000
  const more = rawSize > unit - 1
  const kilo = si ?
    (more ? Math.floor(Math.log(rawSize) / Math.log(unit)) : 0) :
    (more ? Math.floor(Math.log(rawSize) / Math.log(unit)) : 0)
  const pure = rawSize / Math.pow(unit, kilo)
  const size = Math.ceil(pure * step) / step
  const prefix = kilo > 0 ? 'kmgtpezy'[kilo - 1] : ''
  const suffix = !si && more ? 'i' : ''

  return {
    size,
    bytes: rawSize,
    unit: `${prefix}${suffix}b`
  }
}

export { formatFileSize }
