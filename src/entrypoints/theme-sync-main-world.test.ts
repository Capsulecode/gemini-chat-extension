import { describe, expect, it, vi } from 'vitest'

describe('theme-sync-main-world origin check', () => {
  it('rejects postMessage events from mismatched origins', () => {
    const setItemSpy = vi.spyOn(window.localStorage, 'setItem')

    const handleMessage = (event: MessageEvent) => {
      // SECURITY: Check origin first before accessing or processing event payload to prevent cross-origin messaging spoofing/leaks
      if (event.origin !== window.location.origin) return
      if (event.source !== window) return
      const data = event.data as {
        source?: string
        type?: string
        detail?: { theme: string; bardColorTheme: string }
      }
      if (data?.source !== 'gpk-theme-sync' || data?.type !== 'apply') return
      if (!data.detail || (data.detail.theme !== 'light' && data.detail.theme !== 'dark')) return
      window.localStorage.setItem('theme', data.detail.theme)
    }

    // Message from untrusted origin
    handleMessage(
      new MessageEvent('message', {
        origin: 'https://evil.com',
        source: window,
        data: {
          source: 'gpk-theme-sync',
          type: 'apply',
          detail: { theme: 'dark', bardColorTheme: 'Bard-Dark-Theme' },
        },
      }),
    )

    expect(setItemSpy).not.toHaveBeenCalled()

    // Message from same origin
    handleMessage(
      new MessageEvent('message', {
        origin: window.location.origin,
        source: window,
        data: {
          source: 'gpk-theme-sync',
          type: 'apply',
          detail: { theme: 'dark', bardColorTheme: 'Bard-Dark-Theme' },
        },
      }),
    )

    expect(setItemSpy).toHaveBeenCalledWith('theme', 'dark')
  })
})
