import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import configToAlias from '@astropub/config-to-alias/vite';
import Unfonts from 'unplugin-fonts/vite';

export default defineConfig({
    plugins: [configToAlias(), react(), Unfonts({ fontsource: { families: ['Inter'] } })],
});
