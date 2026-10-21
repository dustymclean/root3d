import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// BASE_PATH is "/" on a custom domain (r3dconsulting.com) and "/root3d/" on
// the default github.io project URL. The deploy workflow sets it.
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [react()],
});
