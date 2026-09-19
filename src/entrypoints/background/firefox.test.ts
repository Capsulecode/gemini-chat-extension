import { beforeEach, describe, expect, it, vi } from 'vitest'
import { browser } from 'wxt/browser'
import { OPEN_IN_NEW_TAB_MESSAGE } from '@/types/runtime-messages'
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
    },
  },
}))

const tabsCreateMock = vi.mocked(browser.tabs.create)

describe('firefox background service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    runtimeMessageListener = null
    startFirefoxBackground()
  })

  it('opens a new tab for valid https://gemini.google.com URLs', async () => {
    expect(runtimeMessageListener).not.toBeNull()

    await runtimeMessageListener?.({
      type: OPEN_IN_NEW_TAB_MESSAGE,
      payload: { url: 'https://gemini.google.com/app/c_123#r_456' },
    })

    expect(tabsCreateMock).toHaveBeenCalledWith({
      url: 'https://gemini.google.com/app/c_123#r_456',
    })
  })

  it('blocks open tab requests with non-HTTPS protocols', async () => {
    await runtimeMessageListener?.({
      type: OPEN_IN_NEW_TAB_MESSAGE,
      payload: { url: 'http://gemini.google.com/app/c_123' },
    })

    await runtimeMessageListener?.({
      type: OPEN_IN_NEW_TAB_MESSAGE,
      payload: { url: 'javascript:alert(1)' },
    })

    await runtimeMessageListener?.({
      type: OPEN_IN_NEW_TAB_MESSAGE,
      payload: { url: 'file:///etc/passwd' },
    })

    expect(tabsCreateMock).not.toHaveBeenCalled()
  })

  it('blocks open tab requests for non-gemini origins', async () => {
    await runtimeMessageListener?.({
      type: OPEN_IN_NEW_TAB_MESSAGE,
      payload: { url: 'https://evil.com/app/c_123' },
    })

    expect(tabsCreateMock).not.toHaveBeenCalled()
  })

  it('blocks open tab requests with malformed URLs', async () => {
    await runtimeMessageListener?.({
      type: OPEN_IN_NEW_TAB_MESSAGE,
      payload: { url: 'not-a-url' },
    })

    expect(tabsCreateMock).not.toHaveBeenCalled()
  })
})
