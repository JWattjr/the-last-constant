import { readdirSync } from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Artwork filenames in public/assets, read at startup so absent art never triggers a 404 and nothing is bundled twice.
const artwork = readdirSync(new URL('./public/assets/', import.meta.url));
export default defineConfig({ plugins: [react()], define: { __ARTWORK__: JSON.stringify(artwork) } });
