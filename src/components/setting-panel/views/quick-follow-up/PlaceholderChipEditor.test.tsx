import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { PlaceholderChipEditor } from './PlaceholderChipEditor'

vi.mock('@chakra-ui/react', () => ({
  Box: ({ children, minH, borderColor, borderRadius, lineHeight, whiteSpace, wordBreak, _focus, css, cursor, ...props }: any) => (
    <div {...props}>{children}</div>
  ),
  Text: ({ children, ...props }: any) => <span {...props}>{children}</span>
}))

vi.mock('@/components/ui/color-mode', () => ({
  useColorModeValue: (light: string) => light
}))

vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: any) => <div>{children}</div>
}))

vi.mock('@/utils/i18n', () => ({
  t: (key: string) => {
    if (key === 'settings.quickFollow.chip.label') return '<img src="x" onerror="alert(1)">'
    if (key === 'settings.quickFollow.chip.tooltip') return 'Tooltip "with" \\ special \n chars'
    return key
  }
}))

let root: Root
let container: HTMLDivElement

describe('PlaceholderChipEditor security sanitization', () => {
  beforeEach(() => {
    ;(globalThis as typeof globalThis & {
      IS_REACT_ACT_ENVIRONMENT?: boolean
    }).IS_REACT_ACT_ENVIRONMENT = true
    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it('escapes HTML tags in chip labels to prevent HTML injection', async () => {
    await act(async () => {
      root.render(
        <PlaceholderChipEditor
          value="Hello {{SELECT_TEXT}} world"
          onChange={() => {}}
          placeholder='Placeholder "with" \ quotes'
        />
      )
    })

    const chip = container.querySelector('[data-placeholder-chip="true"]')
    expect(chip).not.toBeNull()
    // Verify that <img ...> is rendered as text, not as an HTML <img> element inside chip
    expect(chip?.querySelector('img')).toBeNull()
    expect(chip?.textContent).toBe('<img src="x" onerror="alert(1)">')

    const styleEl = container.querySelector('style')
    expect(styleEl?.textContent).toContain('content: "Tooltip \\"with\\" \\\\ special \\A  chars";')
  })
})
