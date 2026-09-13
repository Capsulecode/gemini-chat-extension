import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { browser } from 'wxt/browser'

import {
  FIREFOX_GET_INSTANCE_ID_MESSAGE,
  OPEN_IN_NEW_TAB_MESSAGE,
} from '@/types/runtime-messages'
import { startFirefoxBackground } from './firefox'

type RuntimeMessageListener = (message: unknown) => unknown

let runtimeMessageListener: RuntimeMessageListener | null = null

vi.mock('wxt/browser', () => ({
  browser: {
    runtime: {
      onMessage: {
        addListener: vi.fn((listener: RuntimeMessageListener) => {
          runtimeMessageListener = listener
        }),
      },
    },
    webRequest: {
      onBeforeRequest: {
        addListener: vi.fn(),
      },
      onHeadersReceived: {
        addListener: vi.fn(),
      },
      onCompleted: {
        addListener: vi.fn(),
      },
      onErrorOccurred: {
        addListener: vi.fn(),
      },
    },
    tabs: {
      create: vi.fn(() => Promise.resolve({ id: 1 })),
      sendMessage: vi.fn(() => Promise.resolve()),
    },
  },
}))

const tabsCreateMock = vi.mocked(browser.tabs.create)

describe('startFirefoxBackground', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('handles FIREFOX_GET_INSTANCE_ID_MESSAGE', async () => {
    const { startFirefoxBackground } = await import('./firefox')
    startFirefoxBackground()
    if (!runtimeMessageListener) throw new Error('Listener not registered')
    const res = await runtimeMessageListener({ type: FIREFOX_GET_INSTANCE_ID_MESSAGE })
    expect(res).toHaveProperty('instanceId')
  })

  it('allows valid OPEN_IN_NEW_TAB_MESSAGE for gemini.google.com /app/ endpoints', async () => {
    const { startFirefoxBackground } = await import('./firefox')
    startFirefoxBackground()
    if (!runtimeMessageListener) throw new Error('Listener not registered')

    const validUrl = 'https://gemini.google.com/app/c_12345#r_67890'
    await runtimeMessageListener({
      type: OPEN_IN_NEW_TAB_MESSAGE,
      payload: { url: validUrl },
    })

    expect(tabsCreateMock).toHaveBeenCalledWith({ url: validUrl })
  })

  it('blocks OPEN_IN_NEW_TAB_MESSAGE for invalid protocols, domains, or non-/app/ paths', async () => {
    const { startFirefoxBackground } = await import('./firefox')
    startFirefoxBackground()
    if (!runtimeMessageListener) throw new Error('Listener not registered')

    const invalidUrls = [
      'http://gemini.google.com/app/c_123',
      'https://malicious.com/app/c_123',
      'https://gemini.google.com/other/path',
      'javascript:alert(1)',
      'data:text/html,test',
    ]

    for (const url of invalidUrls) {
      tabsCreateMock.mockClear()
      await runtimeMessageListener({
        type: OPEN_IN_NEW_TAB_MESSAGE,
        payload: { url },
      })
      expect(tabsCreateMock).not.toHaveBeenCalled()
    }
  })
})
