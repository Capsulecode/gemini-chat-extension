import { describe, it, expect, beforeEach, vi } from 'vitest'
import themeSyncMainWorld from './theme-sync-main-world'

describe('theme-sync-main-world security message validation', () => {
  beforeEach(() => {
    document.body.className = ''
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('applies theme when valid message event is received from same origin and window', () => {
    themeSyncMainWorld.main()

    const event = new MessageEvent('message', {
      source: window,
      origin: window.location.origin,
      data: {
        source: 'gpk-theme-sync',
        type: 'apply',
        detail: {
          mode: 'dark',
          theme: 'dark',
          bardColorTheme: 'Bard-Dark-Theme',
        },
      },
    })

    window.dispatchEvent(event)

    expect(document.body.classList.contains('dark-theme')).toBe(true)
    expect(localStorage.getItem('theme')).toBe('dark')
    expect(localStorage.getItem('Bard-Color-Theme')).toBe('Bard-Dark-Theme')
  })

  it('ignores message event when bardColorTheme is invalid/untrusted', () => {
    themeSyncMainWorld.main()

    const event = new MessageEvent('message', {
      source: window,
      origin: window.location.origin,
      data: {
        source: 'gpk-theme-sync',
        type: 'apply',
        detail: {
          mode: 'dark',
          theme: 'dark',
          bardColorTheme: 'Invalid-Theme-Payload',
        },
      },
    })

    window.dispatchEvent(event)

    expect(document.body.classList.contains('dark-theme')).toBe(false)
    expect(localStorage.getItem('theme')).toBeNull()
  })
})
