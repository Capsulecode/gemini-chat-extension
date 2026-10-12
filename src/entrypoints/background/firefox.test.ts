import { describe, it, expect, vi, beforeEach } from 'vitest'
import { browser } from 'wxt/browser'
import { startFirefoxBackground } from './firefox'
import { OPEN_IN_NEW_TAB_MESSAGE } from '@/types/runtime-messages'

vi.mock('wxt/browser', () => {
  const listeners: Array<(message: unknown) => unknown> = []
  return {
    browser: {
      webRequest: {
        onBeforeRequest: { addListener: vi.fn() },
        onHeadersReceived: { addListener: vi.fn() },
        onCompleted: { addListener: vi.fn() },
        onErrorOccurred: { addListener: vi.fn() },
      },
      runtime: {
        onMessage: {
          addListener: vi.fn((fn: (message: unknown) => unknown) => {
            listeners.push(fn)
          }),
          _listeners: listeners,
        },
      },
      tabs: {
        create: vi.fn().mockResolvedValue({}),
      },
    },
  }
})

describe('startFirefoxBackground', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('allows opening valid https://gemini.google.com URLs in a new tab', async () => {
    const { startFirefoxBackground: startFn } = await import('./firefox')
    startFn()

    const onMessageListener = (browser.runtime.onMessage.addListener as ReturnType<typeof vi.fn>).mock.calls[0][0] as (message: unknown) => void

    onMessageListener({
      type: OPEN_IN_NEW_TAB_MESSAGE,
      payload: { url: 'https://gemini.google.com/app/123456#response1' },
    })

    expect(browser.tabs.create).toHaveBeenCalledWith({
      url: 'https://gemini.google.com/app/123456#response1',
    })
  })

  it('blocks opening non-https protocols or untrusted origins', async () => {
    const { startFirefoxBackground: startFn } = await import('./firefox')
    startFn()

    const onMessageListener = (browser.runtime.onMessage.addListener as ReturnType<typeof vi.fn>).mock.calls[0][0] as (message: unknown) => void

    // Untrusted origin
    onMessageListener({
      type: OPEN_IN_NEW_TAB_MESSAGE,
      payload: { url: 'https://evil.com/app/123456' },
    })

    // Unsafe protocol javascript:
    onMessageListener({
      type: OPEN_IN_NEW_TAB_MESSAGE,
      payload: { url: 'javascript:alert(1)' },
    })

    // Unsafe protocol data:
    onMessageListener({
      type: OPEN_IN_NEW_TAB_MESSAGE,
      payload: { url: 'data:text/html,<script>alert(1)</script>' },
    })

    // http protocol (non-https)
    onMessageListener({
      type: OPEN_IN_NEW_TAB_MESSAGE,
      payload: { url: 'http://gemini.google.com/app/123' },
    })

    expect(browser.tabs.create).not.toHaveBeenCalled()
  })
})
