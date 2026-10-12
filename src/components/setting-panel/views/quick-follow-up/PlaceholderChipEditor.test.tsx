import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { ChakraProvider } from '@chakra-ui/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { system } from '@/components/ui/system'
import { PlaceholderChipEditor } from './PlaceholderChipEditor'

vi.mock('@/utils/i18n', () => ({
  t: (key: string) => key,
}))

describe('PlaceholderChipEditor', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    ;(globalThis as typeof globalThis & {
      IS_REACT_ACT_ENVIRONMENT?: boolean
    }).IS_REACT_ACT_ENVIRONMENT = true
    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
  })

  it('renders template string with escaped html entities safely', async () => {
    const value = 'Hello "world" & \'test\' <script>'
    const onChange = vi.fn()

    await act(async () => {
      root.render(
        <ChakraProvider value={system}>
          <PlaceholderChipEditor value={value} onChange={onChange} />
        </ChakraProvider>
      )
    })

    const editorDiv = container.querySelector('[contenteditable="true"]')
    expect(editorDiv).not.toBeNull()
    // DOM normalizes &quot; and &#39; back to " and ' in innerHTML, but <script> remains escaped as &lt;script&gt;
    expect(editorDiv?.innerHTML).toBe('Hello "world" &amp; \'test\' &lt;script&gt;')
  })
})
