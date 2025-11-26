import React from 'react'
import ReactDOM from 'react-dom/client'
import '@mantine/core/styles.css'
import { MantineProvider } from '@mantine/core'
import App from './App'
import './index.css'
import { theme } from './theme'

function Root() {
  return (
    <React.StrictMode>
      <MantineProvider defaultColorScheme="light" theme={theme}>
        <App />
      </MantineProvider>
    </React.StrictMode>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(<Root />)

export default Root
