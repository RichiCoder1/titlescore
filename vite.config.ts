import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import configToAlias from '@astropub/config-to-alias/vite';

export default defineConfig({
    plugins: [configToAlias(), react()],
});
