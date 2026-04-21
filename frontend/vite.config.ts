import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function matchesPackage(id: string, packages: string[]) {
  return packages.some((pkg) => id.includes(`/node_modules/${pkg}/`))
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replace(/\\/g, '/')

          if (!normalizedId.includes('/node_modules/')) {
            return undefined
          }

          if (
            matchesPackage(normalizedId, [
              'chart.js',
              'react-chartjs-2',
              'chartjs-adapter-date-fns',
              'date-fns',
            ])
          ) {
            return 'chart-vendor'
          }

          if (
            matchesPackage(normalizedId, [
              '@mantine/core',
              '@mantine/hooks',
              '@mantine/notifications',
              '@emotion/react',
              '@emotion/cache',
              '@emotion/serialize',
              '@emotion/sheet',
              '@emotion/unitless',
              '@emotion/utils',
              '@emotion/weak-memoize',
              '@tabler/icons-react',
            ])
          ) {
            return 'ui-vendor'
          }

          if (matchesPackage(normalizedId, ['react', 'react-dom', 'scheduler'])) {
            return 'react-vendor'
          }

          if (matchesPackage(normalizedId, ['axios'])) {
            return 'http-vendor'
          }

          return 'vendor'
        },
      },
    },
  },
})
