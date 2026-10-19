import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.hoisted(() => {
  ;(globalThis as any).defineUnlistedScript = (fn: () => void) => ({ main: fn })
})

import themeSyncMainWorld from './theme-sync-main-world'

describe('theme-sync-main-world security & event handling', () => {
  let messageHandler: ((event: MessageEvent) => void) | null = null

  beforeEach(() => {
    document.body.className = ''
    localStorage.clear()
    document.documentElement.removeAttribute('data-gpk-theme-sync-ready')

    vi.spyOn(window, 'addEventListener').mockImplementation((type, listener) => {
      if (type === 'message') {
        messageHandler = listener as (event: MessageEvent) => void
      }
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    messageHandler = null
  })

  it('sets ready attribute on initialization', () => {
    themeSyncMainWorld.main()
    expect(document.documentElement.getAttribute('data-gpk-theme-sync-ready')).toBe('true')
    expect(messageHandler).not.toBeNull()
  })

  it('applies theme when receiving valid message from valid origin', () => {
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

    messageHandler!(event)

    expect(document.body.classList.contains('dark-theme')).toBe(true)
    expect(localStorage.getItem('theme')).toBe('dark')
    expect(localStorage.getItem('Bard-Color-Theme')).toBe('Bard-Dark-Theme')
  })

  it('ignores message if event.source is not window', () => {
    themeSyncMainWorld.main()

    const fakeWindow = {} as Window
    const event = new MessageEvent('message', {
      source: fakeWindow,
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

    messageHandler!(event)

    expect(document.body.classList.contains('dark-theme')).toBe(false)
  })

  it('ignores message if origin is untrusted or null', () => {
    themeSyncMainWorld.main()

    const untrustedEvent = new MessageEvent('message', {
      source: window,
      origin: 'https://evil.com',
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

    messageHandler!(untrustedEvent)

    expect(document.body.classList.contains('dark-theme')).toBe(false)

    const nullOriginEvent = new MessageEvent('message', {
      source: window,
      origin: 'null',
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

    messageHandler!(nullOriginEvent)

    expect(document.body.classList.contains('dark-theme')).toBe(false)
  })

  it('ignores message with invalid mode or bardColorTheme payload', () => {
    themeSyncMainWorld.main()

    const invalidModeEvent = new MessageEvent('message', {
      source: window,
      origin: window.location.origin,
      data: {
        source: 'gpk-theme-sync',
        type: 'apply',
        detail: {
          mode: 'invalid-mode',
          theme: 'dark',
          bardColorTheme: 'Bard-Dark-Theme',
        },
      },
    })

    messageHandler!(invalidModeEvent)
    expect(document.body.classList.contains('dark-theme')).toBe(false)

    const invalidBardThemeEvent = new MessageEvent('message', {
      source: window,
      origin: window.location.origin,
      data: {
        source: 'gpk-theme-sync',
        type: 'apply',
        detail: {
          mode: 'dark',
          theme: 'dark',
          bardColorTheme: 'Malicious-Theme-Inject',
        },
      },
    })

    messageHandler!(invalidBardThemeEvent)
    expect(document.body.classList.contains('dark-theme')).toBe(false)
  })
})
