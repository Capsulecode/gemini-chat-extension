import { describe, expect, it } from 'vitest'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { act } from 'react'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { ChatLayoutSettings } from './index'

describe('ChatLayoutSettings SvgIcon sanitization', () => {
  it('renders SVG icons safely and strips dangerous tags, javascript URIs, and event handlers', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <ChakraProvider value={defaultSystem}>
          <ChatLayoutSettings />
        </ChakraProvider>
      )
    })

    // SvgIcon elements rendered inside ChatLayoutSettings
    const svgIcons = container.querySelectorAll('[data-chat-layout-settings] svg')
    expect(svgIcons.length).toBeGreaterThan(0)

    svgIcons.forEach((svg) => {
      expect(svg.querySelector('script')).toBeNull()
      expect(svg.querySelector('foreignObject')).toBeNull()
      expect(svg.querySelector('iframe')).toBeNull()
      expect(svg.hasAttribute('onload')).toBe(false)
      expect(svg.getAttribute('href')?.startsWith('javascript:')).toBeFalsy()
    })

    await act(async () => {
      root.unmount()
    })
    container.remove()
  })
})
