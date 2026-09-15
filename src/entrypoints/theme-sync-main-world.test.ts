import { describe, it, expect, beforeEach, vi } from 'vitest'

// Provide global defineUnlistedScript for WXT auto-imports in test environment
;(globalThis as any).defineUnlistedScript = (fn: () => void) => ({ main: fn })

import themeSyncMainWorld from './theme-sync-main-world'

describe('theme-sync-main-world', () => {
  beforeEach(() => {
    document.body.className = ''
    document.documentElement.removeAttribute('data-gpk-theme-sync-ready')
    window.localStorage.clear()
  })

  it('initializes and sets data-gpk-theme-sync-ready attribute', () => {
    ;(themeSyncMainWorld as any).main()
    expect(document.documentElement.getAttribute('data-gpk-theme-sync-ready')).toBe('true')
  })

  it('applies theme when valid postMessage event is received', () => {
    ;(themeSyncMainWorld as any).main()

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
    expect(window.localStorage.getItem('theme')).toBe('dark')
    expect(window.localStorage.getItem('Bard-Color-Theme')).toBe('Bard-Dark-Theme')
  })

  it('rejects postMessage with invalid bardColorTheme', () => {
    ;(themeSyncMainWorld as any).main()

    const event = new MessageEvent('message', {
      source: window,
      origin: window.location.origin,
      data: {
        source: 'gpk-theme-sync',
        type: 'apply',
        detail: {
          mode: 'dark',
          theme: 'dark',
          bardColorTheme: 'INVALID_THEME',
        },
      },
    })

    window.dispatchEvent(event)

    expect(document.body.classList.contains('dark-theme')).toBe(false)
    expect(window.localStorage.getItem('theme')).toBeNull()
    expect(window.localStorage.getItem('Bard-Color-Theme')).toBeNull()
  })

  it('rejects postMessage with invalid mode or theme', () => {
    ;(themeSyncMainWorld as any).main()

    const event = new MessageEvent('message', {
      source: window,
      origin: window.location.origin,
      data: {
        source: 'gpk-theme-sync',
        type: 'apply',
        detail: {
          mode: 'unsupported_mode',
          theme: 'dark',
          bardColorTheme: 'Bard-Dark-Theme',
        },
      },
    })

    window.dispatchEvent(event)

    expect(document.body.classList.contains('dark-theme')).toBe(false)
    expect(window.localStorage.getItem('theme')).toBeNull()
  })
})
