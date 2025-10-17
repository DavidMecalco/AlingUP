import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  const isProduction = mode === 'production'
  const isStaging = mode === 'staging'
  const isDevelopment = mode === 'development'

  return {
    plugins: [
      react({
        // Enable React Compiler in production
        babel: {
          plugins: isProduction ? [['babel-plugin-react-compiler', {}]] : [],
        },
      }),
    ],
    
    // Path resolution
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        '@components': resolve(__dirname, './src/components'),
        '@pages': resolve(__dirname, './src/pages'),
        '@services': resolve(__dirname, './src/services'),
        '@hooks': resolve(__dirname, './src/hooks'),
        '@contexts': resolve(__dirname, './src/contexts'),
        '@utils': resolve(__dirname, './src/utils'),
        '@assets': resolve(__dirname, './src/assets'),
      },
    },

    // Development server configuration
    server: {
      port: 3000,
      host: true,
      open: true,
      cors: true,
    },

    // Preview server configuration
    preview: {
      port: 4173,
      host: true,
      open: true,
    },

    // Build configuration
    build: {
      // Output directory
      outDir: 'dist',
      
      // Generate sourcemaps for production debugging
      sourcemap: isProduction ? 'hidden' : true,
      
      // Minification
      minify: isProduction ? 'esbuild' : false,
      
      // Target browsers
      target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
      
      // Chunk size warning limit
      chunkSizeWarningLimit: 1000,
      
      // Rollup options
      rollupOptions: {
        output: {
          // Manual chunks for better caching
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
                return 'react-vendor'
              }
              if (id.includes('lucide-react') || id.includes('recharts') || id.includes('@hello-pangea/dnd')) {
                return 'ui-vendor'
              }
              if (id.includes('@supabase/supabase-js')) {
                return 'supabase-vendor'
              }
              return 'vendor'
            }
          },
          
          // Chunk file naming
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]',
        },
      },
      
      // Asset optimization
      assetsInlineLimit: 4096, // 4kb
      
      // CSS code splitting
      cssCodeSplit: true,
      
      // Report compressed size
      reportCompressedSize: isProduction,
      
      // Write bundle info
      write: true,
    },

    // CSS configuration
    css: {
      // PostCSS configuration is handled by postcss.config.js
      devSourcemap: !isProduction,
      
      // CSS modules configuration
      modules: {
        localsConvention: 'camelCase',
      },
    },

    // Environment variables
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      __IS_PRODUCTION__: JSON.stringify(isProduction),
      __IS_STAGING__: JSON.stringify(isStaging),
      __IS_DEVELOPMENT__: JSON.stringify(isDevelopment),
    },

    // Optimization
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@supabase/supabase-js',
        'date-fns',
        'lucide-react',
        'recharts',
        '@hello-pangea/dnd',
        'react-dropzone',
      ],
      exclude: [
        // Exclude large dependencies that should be loaded dynamically
      ],
    },

    // ESBuild configuration
    esbuild: isProduction ? {
      drop: ['console', 'debugger'],
      legalComments: 'none',
    } : false,

    // Worker configuration
    worker: {
      format: 'es',
    },
  }
})
