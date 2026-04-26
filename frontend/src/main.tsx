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
          fontFamily: mantineTheme.fontFamily,
        },
        html: {
          scrollBehavior: 'smooth',
        },
        '#root': {
          minHeight: '100vh',
          isolation: 'isolate',
        },
        img: {
          display: 'block',
          maxWidth: '100%',
        },
        a: {
          color: 'inherit',
          textDecoration: 'none',
        },
        '@keyframes bbs2-fan-glow': {
          '0%, 100%': {
            transform: 'scale(1)',
            opacity: 0.72,
          },
          '50%': {
            transform: 'scale(1.08)',
            opacity: 1,
          },
        },
        '@keyframes bbs2-dynamic-text-enter': {
          '0%': {
            opacity: 0,
            transform: 'translateY(0.38em)',
            filter: 'blur(3px)',
          },
          '58%': {
            opacity: 1,
            transform: 'translateY(-0.06em)',
            filter: 'blur(0)',
          },
          '100%': {
            opacity: 1,
            transform: 'translateY(0)',
            filter: 'blur(0)',
          },
        },
        '@keyframes bbs2-status-text-enter': {
          '0%': {
            opacity: 0,
            transform: 'translateY(0.32em) scale(0.98)',
            filter: 'blur(3px)',
          },
          '52%': {
            opacity: 1,
            transform: 'translateY(-0.05em) scale(1.03)',
            filter: 'blur(0)',
          },
          '100%': {
            opacity: 1,
            transform: 'translateY(0) scale(1)',
            filter: 'blur(0)',
          },
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
