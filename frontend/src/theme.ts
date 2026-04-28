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
  '#effbff',
  '#d9f3ff',
  '#b5e6fb',
  '#8bd8f4',
  '#68cceb',
  '#4fc4e6',
  '#2daed2',
  '#1f91b3',
  '#1d7591',
  '#185f77',
]

const amber: MantineColorsTuple = [
  '#f1f5ff',
  '#dfe8ff',
  '#bdceff',
  '#98b2ff',
  '#7b9cff',
  '#688cff',
  '#5276ea',
  '#4262cc',
  '#364fa5',
  '#2f4585',
]

export const theme = createTheme({
  fontFamily: 'Manrope, system-ui, sans-serif',
  headings: {
    fontFamily: '"Space Grotesk", Manrope, system-ui, sans-serif',
    fontWeight: '700',
  },
  primaryColor: 'ocean',
  defaultRadius: 'lg',
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
        radius: 'lg',
      },
    },
    Badge: {
      defaultProps: {
        radius: 'md',
      },
    },
    Button: {
      defaultProps: {
        radius: 'md',
      },
    },
    ActionIcon: {
      defaultProps: {
        radius: 'md',
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
