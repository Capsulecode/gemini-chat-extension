import { describe, it, expect, vi, beforeEach } from 'vitest'
import { browser } from 'wxt/browser'
import { OPEN_IN_NEW_TAB_MESSAGE, FIREFOX_GET_INSTANCE_ID_MESSAGE } from '@/types/runtime-messages'

vi.mock('wxt/browser', () => {
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
          addListener: vi.fn(),
        },
      },
      tabs: {
        create: vi.fn().mockResolvedValue({ id: 1 }),
      },
    },
  }
})

describe('startFirefoxBackground', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('allows valid https://gemini.google.com URLs', async () => {
    const { startFirefoxBackground } = await import('./firefox')
    startFirefoxBackground()

    const listener = (browser.runtime.onMessage.addListener as any).mock.calls[0][0]

    listener({
      type: OPEN_IN_NEW_TAB_MESSAGE,
      payload: { url: 'https://gemini.google.com/app/12345' },
    })

    expect(browser.tabs.create).toHaveBeenCalledWith({
      url: 'https://gemini.google.com/app/12345',
    })
  })

  it('blocks non-https protocols (e.g. http:)', async () => {
    const { startFirefoxBackground } = await import('./firefox')
    startFirefoxBackground()

    const listener = (browser.runtime.onMessage.addListener as any).mock.calls[0][0]

    listener({
      type: OPEN_IN_NEW_TAB_MESSAGE,
      payload: { url: 'http://gemini.google.com/app/12345' },
    })

    expect(browser.tabs.create).not.toHaveBeenCalled()
  })

  it('blocks javascript: scheme and other non-http(s) schemes', async () => {
    const { startFirefoxBackground } = await import('./firefox')
    startFirefoxBackground()

    const listener = (browser.runtime.onMessage.addListener as any).mock.calls[0][0]

    listener({
      type: OPEN_IN_NEW_TAB_MESSAGE,
      payload: { url: 'javascript:alert(1)' },
    })

    expect(browser.tabs.create).not.toHaveBeenCalled()
  })

  it('blocks domain spoofing attempts like gemini.google.com.attacker.com', async () => {
    const { startFirefoxBackground } = await import('./firefox')
    startFirefoxBackground()

    const listener = (browser.runtime.onMessage.addListener as any).mock.calls[0][0]

    listener({
      type: OPEN_IN_NEW_TAB_MESSAGE,
      payload: { url: 'https://gemini.google.com.attacker.com/app/12345' },
    })

    expect(browser.tabs.create).not.toHaveBeenCalled()
  })

  it('handles instance id message', async () => {
    const { startFirefoxBackground } = await import('./firefox')
    startFirefoxBackground()

    const listener = (browser.runtime.onMessage.addListener as any).mock.calls[0][0]

    const res = await listener({
      type: FIREFOX_GET_INSTANCE_ID_MESSAGE,
    })

    expect(res).toHaveProperty('instanceId')
    expect(typeof res.instanceId).toBe('string')
  })
})
