import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MediaItemStatus, type MediaItem } from '@/utils/stuffMediaParser'
import { stuffDataCache } from './dataCache'
import { resolveOpenInNewTabUrl, isAllowedNavigationUrl, handleOpenInNewTab } from './navigation'

vi.mock('wxt/browser', () => ({
  browser: {
    runtime: {
      sendMessage: vi.fn(() => Promise.resolve()),
    },
  },
}))

function createMediaItem(overrides: Partial<MediaItem> = {}): MediaItem {
  return {
    conversationId: 'c_abc123',
    responseId: 'r_def456',
    timestamp: 1781940312,
    timestampNano: 0,
    status: MediaItemStatus.Normal,
    resourceId: 'rc_test',
    hasImage: true,
    date: new Date(1781940312 * 1000),
    ...overrides,
  }
}

function createCard(jslog: string | null): Element {
  const card = document.createElement('library-item-card')
  if (jslog) {
    card.setAttribute('jslog', jslog)
  }
  return card
}

describe('resolveOpenInNewTabUrl', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/library')
    stuffDataCache.clear()
  })

  afterEach(() => {
    document.body.innerHTML = ''
    stuffDataCache.clear()
  })

  it('returns an app URL when timestamp data is cached', () => {
    stuffDataCache.addItems([createMediaItem()])
    const card = createCard('299880;data:[1,[1781940312,603866744]]')

    expect(resolveOpenInNewTabUrl(card)).toBe(`${window.location.origin}/app/abc123#def456`)
  })

  it('returns null when timestamp data is missing from cache', () => {
    const card = createCard('299880;data:[1,[1781940312,603866744]]')

    expect(resolveOpenInNewTabUrl(card)).toBeNull()
  })

  it('returns an app URL for audio cards matched by title', () => {
    stuffDataCache.addItems([
      createMediaItem({
        conversationId: 'c_audio',
        responseId: 'r_title',
        timestamp: 0,
        status: MediaItemStatus.Audio,
        title: 'Audio title',
        hasImage: false,
      }),
    ])
    const card = createCard('299880;data:[3,[]]')
    card.innerHTML = `
      <div class="library-item-card">
        <div class="header">
          <div class="title">Audio title</div>
        </div>
      </div>
    `

    expect(resolveOpenInNewTabUrl(card)).toBe(`${window.location.origin}/app/audio#title`)
  })

  it('returns null for cards without usable identifiers', () => {
    stuffDataCache.addItems([
      createMediaItem({
        conversationId: 'c_',
        responseId: 'r_',
      }),
    ])
    const card = createCard('299880;data:[1,[1781940312,603866744]]')

    expect(resolveOpenInNewTabUrl(card)).toBeNull()
  })

  it('returns null for missing jslog, malformed jslog, or missing audio title', () => {
    expect(resolveOpenInNewTabUrl(createCard(null))).toBeNull()
    expect(resolveOpenInNewTabUrl(createCard('invalid'))).toBeNull()
    expect(resolveOpenInNewTabUrl(createCard('299880;data:[3,[]]'))).toBeNull()
  })
})

describe('isAllowedNavigationUrl security checks', () => {
  it('accepts valid origin URLs', () => {
    expect(isAllowedNavigationUrl(`${window.location.origin}/app/123#456`)).toBe(true)
  })

  it('rejects untrusted external origins and javascript/data schemes', () => {
    expect(isAllowedNavigationUrl('https://evil.com/app')).toBe(false)
    expect(isAllowedNavigationUrl('javascript:alert(1)')).toBe(false)
    expect(isAllowedNavigationUrl('data:text/html,<script>alert(1)</script>')).toBe(false)
  })

  it('blocks opening untrusted URLs in handleOpenInNewTab', () => {
    const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
    handleOpenInNewTab('javascript:alert(1)')
    expect(windowOpenSpy).not.toHaveBeenCalled()
    windowOpenSpy.mockRestore()
  })
})
