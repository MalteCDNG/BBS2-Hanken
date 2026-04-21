import { MantineColorsTuple, createTheme } from '@mantine/core'

const ocean: MantineColorsTuple = [
  '#edf5ff',
  '#d8e7ff',
  '#b0ccff',
  '#84b0ff',
  '#6297ff',
  '#4987ff',
  '#387ceb',
  '#286bcf',
  '#1d5fb9',
  '#0a4f9f',
]

const seafoam: MantineColorsTuple = [
  '#ebfff9',
  '#d2fbee',
  '#a4f4dd',
  '#71ebca',
  '#4be3bb',
  '#33ddaf',
  '#21c89b',
  '#14b186',
  '#069b74',
  '#007d5c',
]

const amber: MantineColorsTuple = [
  '#fff8e7',
  '#ffefc8',
  '#ffdd8f',
  '#ffca52',
  '#ffbb27',
  '#ffb10a',
  '#e69a00',
  '#cc8700',
  '#b27500',
  '#986000',
]

export const theme = createTheme({
  fontFamily: 'Manrope, system-ui, sans-serif',
  headings: {
    fontFamily: '"Space Grotesk", Manrope, system-ui, sans-serif',
    fontWeight: '700',
  },
  primaryColor: 'ocean',
  defaultRadius: 'xl',
  cursorType: 'pointer',
  defaultGradient: { from: 'ocean.7', to: 'seafoam.5', deg: 145 },
  breakpoints: {
    xs: '30em',
    sm: '36em',
    md: '48em',
    lg: '62em',
    xl: '75em',
  },
  colors: {
    ocean,
    seafoam,
    amber,
  },
  shadows: {
    card: '0 24px 70px rgba(14, 30, 56, 0.14)',
    soft: '0 16px 40px rgba(14, 30, 56, 0.08)',
    glass: '0 18px 48px rgba(14, 30, 56, 0.18)',
  },
  components: {
    Paper: {
      defaultProps: {
        radius: 'xl',
      },
    },
    Badge: {
      defaultProps: {
        radius: 'xl',
      },
    },
    Button: {
      defaultProps: {
        radius: 'xl',
      },
    },
    ActionIcon: {
      defaultProps: {
        radius: 'xl',
      },
    },
    AppShell: {
      defaultProps: {
        padding: 'lg',
      },
    },
  },
})

export type AppTheme = typeof theme
