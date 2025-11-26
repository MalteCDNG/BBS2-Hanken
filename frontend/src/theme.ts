import { MantineColorsTuple, createTheme } from '@mantine/core'

const ocean: MantineColorsTuple = [
  '#edf3ff',
  '#d7e2ff',
  '#b0c5ff',
  '#86a4ff',
  '#6689fb',
  '#4f77f0',
  '#406be0',
  '#3357c6',
  '#2d4cae',
  '#273f8f',
]

const mint: MantineColorsTuple = [
  '#edfff7',
  '#d6f9ea',
  '#adf0d5',
  '#7fe5bd',
  '#5adcb0',
  '#3ed1a2',
  '#2cc392',
  '#1ca278',
  '#168563',
  '#0d6047',
]

export const theme = createTheme({
  fontFamily: 'Inter, system-ui, sans-serif',
  primaryColor: 'ocean',
  defaultRadius: 'lg',
  defaultGradient: { from: 'ocean.6', to: 'mint.5', deg: 135 },
  breakpoints: {
    xs: '30em',
    sm: '36em',
    md: '48em',
    lg: '62em',
    xl: '75em',
  },
  colors: {
    ocean,
    mint,
  },
  shadows: {
    card: '0 20px 45px rgba(17, 24, 39, 0.08)',
    soft: '0 10px 25px rgba(17, 24, 39, 0.05)',
  },
  components: {
    Paper: {
      defaultProps: {
        radius: 'lg',
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
