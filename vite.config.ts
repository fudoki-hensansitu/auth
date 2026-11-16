import { voidReact } from '@void/react/plugin';
import { voidPlugin } from 'void';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [voidPlugin(), voidReact()],
});
