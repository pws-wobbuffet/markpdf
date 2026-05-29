import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://pws-wobbuffet.github.io',
  base: '/markpdf',
  integrations: [react()],
  output: 'static',
});
