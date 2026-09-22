import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  FIREFOX_GET_INSTANCE_ID_MESSAGE,
  OPEN_IN_NEW_TAB_MESSAGE,
} from '@/types/runtime-messages'

let listener: ((message: unknown) => unknown) | null = null

vi.mock('wxt/browser', () => ({
  browser: {
    webRequest: {
      onBeforeRequest: { addListener: vi.fn() },
      onHeadersReceived: { addListener: vi.fn() },
      onCompleted: { addListener: vi.fn() },
      onErrorOccurred: { addListener: vi.fn() },
    },
    runtime: {
      onMessage: {
        addListener: vi.fn((fn) => {
          listener = fn
        }),
      },
    },
    tabs: {
      create: vi.fn().mockResolvedValue({ id: 1 }),
    },
  },
}))

describe('Firefox background message listener', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    listener = null
    vi.resetModules()
    const { startFirefoxBackground } = await import('./firefox')
    startFirefoxBackground()
  })

  it('handles null, undefined, or primitive messages safely without throwing', () => {
    expect(listener).not.toBeNull()
    if (!listener) return

    expect(() => listener(null)).not.toThrow()
    expect(listener(null)).toBeUndefined()

    expect(() => listener(undefined)).not.toThrow()
    expect(listener(undefined)).toBeUndefined()

    expect(() => listener('string-message')).not.toThrow()
    expect(listener('string-message')).toBeUndefined()

    expect(() => listener(123)).not.toThrow()
    expect(listener(123)).toBeUndefined()
  })

  it('responds to firefox instance id message when valid', async () => {
    expect(listener).not.toBeNull()
    if (!listener) return

    const responsePromise = listener({ type: FIREFOX_GET_INSTANCE_ID_MESSAGE })
    expect(responsePromise).toBeInstanceOf(Promise)
    const result = await responsePromise
    expect(result).toHaveProperty('instanceId')
    expect(typeof (result as { instanceId: string }).instanceId).toBe('string')
  })

  it('handles open in new tab message for gemini origin', async () => {
    const { browser } = await import('wxt/browser')
    expect(listener).not.toBeNull()
    if (!listener) return

    listener({
      type: OPEN_IN_NEW_TAB_MESSAGE,
      payload: { url: 'https://gemini.google.com/app' },
    })

    expect(browser.tabs.create).toHaveBeenCalledWith({
      url: 'https://gemini.google.com/app',
    })
  })

  it('blocks open in new tab message for non-gemini origin', async () => {
    const { browser } = await import('wxt/browser')
    expect(listener).not.toBeNull()
    if (!listener) return

    listener({
      type: OPEN_IN_NEW_TAB_MESSAGE,
      payload: { url: 'https://evil.com' },
    })

    expect(browser.tabs.create).not.toHaveBeenCalled()
  })
})
