import { describe, expect, it } from 'vitest'
import { sanitizeSvg } from './index'

describe('sanitizeSvg', () => {
  it('allows safe SVG markup', () => {
    const raw = '<svg><path d="M0 0h10v10H0z"/></svg>'
    const clean = sanitizeSvg(raw)
    expect(clean).toContain('<path d="M0 0h10v10H0z"')
    expect(clean).not.toContain('<script')
  })

  it('removes script tags', () => {
    const raw = '<svg><script>alert("xss")</script><path d="M0 0"/></svg>'
    const clean = sanitizeSvg(raw)
    expect(clean).not.toContain('<script')
    expect(clean).not.toContain('alert')
    expect(clean).toContain('<path')
  })

  it('removes foreignObject tags', () => {
    const raw = '<svg><foreignObject><iframe></iframe></foreignObject><rect/></svg>'
    const clean = sanitizeSvg(raw)
    expect(clean).not.toContain('foreignObject')
    expect(clean).not.toContain('iframe')
    expect(clean).toContain('<rect')
  })

  it('strips inline event handlers', () => {
    const raw = '<svg><rect onload="alert(1)" onclick="doSomething()" fill="red"/></svg>'
    const clean = sanitizeSvg(raw)
    expect(clean).not.toContain('onload')
    expect(clean).not.toContain('onclick')
    expect(clean).toContain('fill="red"')
  })

  it('strips javascript: URIs in attributes', () => {
    const raw = '<svg><a href="javascript:alert(1)"><circle r="5"/></a></svg>'
    const clean = sanitizeSvg(raw)
    expect(clean).not.toContain('javascript:')
  })
})
