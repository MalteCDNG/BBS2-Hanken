import React from 'react'
import ReactDOM from 'react-dom/client'
import '@mantine/core/styles.css'
import { Global } from '@emotion/react'
import {
  ColorSchemeScript,
  MantineProvider,
  localStorageColorSchemeManager,
  useComputedColorScheme,
  useMantineTheme,
} from '@mantine/core'
import App from './App'
import { theme } from './theme'

function AppGlobalStyles() {
  const mantineTheme = useMantineTheme()
  const colorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true })

  const bodyBackground = colorScheme === 'dark' ? mantineTheme.colors.dark[7] : mantineTheme.colors.gray[0]
  const bodyColor = colorScheme === 'dark' ? mantineTheme.colors.gray[0] : mantineTheme.colors.dark[9]

  return (
    <Global
      styles={{
        ':root': {
          textRendering: 'optimizeLegibility',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        },
        '*': {
          boxSizing: 'border-box',
        },
        body: {
          margin: 0,
          minHeight: '100vh',
          backgroundColor: bodyBackground,
          color: bodyColor,
          fontFamily: 'Inter, system-ui, sans-serif',
        },
        a: {
          color: 'inherit',
        },
      }}
    />
  )
}

const colorSchemeManager = localStorageColorSchemeManager({ key: 'bbs2-hanken-color-scheme' })

function Root() {
  return (
    <React.StrictMode>
      <ColorSchemeScript defaultColorScheme="auto" />
      <MantineProvider
        defaultColorScheme="auto"
        theme={theme}
        colorSchemeManager={colorSchemeManager}
      >
        <AppGlobalStyles />
        <App />
      </MantineProvider>
    </React.StrictMode>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(<Root />)

export default Root
