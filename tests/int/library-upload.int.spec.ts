import { describe, expect, it } from 'vitest'

import { isChosenUpload } from '@/lib/uploads/chosen'

describe('library file choice', () => {
  it('accepts a file sent in the form', () => {
    expect(isChosenUpload(new File(['guide'], 'guide.pdf', { type: 'application/pdf' }))).toBe(true)
  })

  it('accepts a file already uploaded to storage', () => {
    expect(isChosenUpload('incoming:incoming/11111111-1111-1111-1111-111111111111/Guide.pdf')).toBe(true)
  })

  it('rejects an empty choice', () => {
    expect(isChosenUpload(null)).toBe(false)
    expect(isChosenUpload('')).toBe(false)
    expect(isChosenUpload(new File([], 'empty.pdf'))).toBe(false)
  })
})
