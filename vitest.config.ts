import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

/*
  "scripts": {
    "test": "NODE_ENV=dev jest",
    "test:watch": "NODE_ENV=dev jest --watch",
    "test:coverage": "NODE_ENV=dev jest --coverage"
  },
*/

export default defineConfig({

  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },

  test: {
    globals: true,
  }

})
