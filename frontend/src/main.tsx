import React from 'react'
import ReactDOM from 'react-dom/client'
import '@mantine/core/styles.css'
import './app-motion.css'
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

  const bodyBackground = colorScheme === 'dark' ? mantineTheme.colors.dark[7] : '#f6f9fe'
  const bodyColor = colorScheme === 'dark' ? mantineTheme.colors.gray[0] : '#10233f'

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
            transform: 'translateY(0.18em) scale(0.995)',
            filter: 'blur(2px)',
          },
          '100%': {
            opacity: 1,
            transform: 'translateY(0) scale(1)',
            filter: 'blur(0)',
          },
        },
        '@keyframes bbs2-status-text-enter': {
          '0%': {
            opacity: 0,
            transform: 'translateY(0.16em) scale(0.99)',
            filter: 'blur(2px)',
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
      <ColorSchemeScript defaultColorScheme="light" />
      <MantineProvider
        defaultColorScheme="light"
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
