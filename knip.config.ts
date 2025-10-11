import type { KnipConfig } from 'knip'

const config: KnipConfig = {
  entry: [
    'src/client.tsx', // atau file utama yang menjalankan aplikasi kamu
    "src/server.tsx",
    "src/routeTree.gen.ts",
    'src/socket-server.ts'
    
  ],
  project: ['src/**/*.ts', 'src/**/*.tsx'],
  ignore: ['src/components/ui/**', 'src/routeTree.gen.ts'],
  ignoreDependencies: ['tailwindcss', 'tw-animate-css'],
  vite: true, // penting kalau kamu pakai Vite (termasuk TanStack Start)
}

export default config
