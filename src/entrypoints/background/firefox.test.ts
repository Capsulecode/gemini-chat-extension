import { describe, it, expect, vi, beforeEach } from 'vitest'
import { OPEN_IN_NEW_TAB_MESSAGE } from '@/types/runtime-messages'

const mockAddListener = vi.fn()
const mockCreateTab = vi.fn().mockResolvedValue({})

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
        addListener: (fn: Function) => mockAddListener(fn),
      },
    },
    tabs: {
      create: (opts: unknown) => mockCreateTab(opts),
    },
  },
}))

describe('startFirefoxBackground', () => {
  let startFirefoxBackground: () => void

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()
    const mod = await import('./firefox')
    startFirefoxBackground = mod.startFirefoxBackground
  })

  it('opens a new tab for valid https gemini.google.com URLs', () => {
    startFirefoxBackground()

    expect(mockAddListener).toHaveBeenCalled()
    const listener = mockAddListener.mock.calls[0][0]

    const validMessage = {
      type: OPEN_IN_NEW_TAB_MESSAGE,
      payload: { url: 'https://gemini.google.com/app/12345' },
    }

    listener(validMessage)

    expect(mockCreateTab).toHaveBeenCalledWith({
      url: 'https://gemini.google.com/app/12345',
    })
  })

  it('blocks open tab requests for non-https schemes or invalid origins', () => {
    startFirefoxBackground()

    const listener = mockAddListener.mock.calls[0][0]

    const invalidUrls = [
      'javascript:alert(1)',
      'data:text/html,<script>alert(1)</script>',
      'http://gemini.google.com/app/12345',
      'https://attacker.com/app/12345',
      'file:///etc/passwd',
    ]

    for (const url of invalidUrls) {
      mockCreateTab.mockClear()
      listener({
        type: OPEN_IN_NEW_TAB_MESSAGE,
        payload: { url },
      })
      expect(mockCreateTab).not.toHaveBeenCalled()
    }
  })
})
