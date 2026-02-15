import { formatFileSize } from '@/helpers/File'

describe('File size formatter', () => {

  it('Should return correct file size in KiB', () => {
    const bytes = 8077979053
    const checkSize = 8.08
    const checkUnit = 'gb'
    const res = formatFileSize(bytes, false, 2)

    expect(res.bytes).toBe(bytes)
    expect(res.unit).toBe(checkUnit)
    expect(res.size).toBe(checkSize)
  })

  it('Should return correct file size in KB', () => {
    const bytes = 6435270646
    const checkSize = 6
    const checkUnit = 'gib'
    const res = formatFileSize(bytes, true, 2)

    expect(res.bytes).toBe(bytes)
    expect(res.unit).toBe(checkUnit)
    expect(res.size).toBe(checkSize)
  })

})
