import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			'@game': path.resolve(__dirname, 'src/game'),
			'@server': path.resolve(__dirname, 'src/server'),
			'@client': path.resolve(__dirname, 'src/client'),
			src: path.resolve(__dirname, 'src'),
		},
	},
	publicDir: 'public',
	define: {
		'import.meta.env.npm_package_version': `"${process.env.npm_package_version}"`,
	},
	build: {
		outDir: 'dist',
		emptyOutDir: true,
		minify: true,
		cssMinify: true,
		rollupOptions: {
			output: {
				manualChunks: {
					phaser: ['phaser'],
				},
			},
		},
	},
	server: {
		port: 8000,
		host: true,
		proxy: {
			'/api': {
				target: 'http://localhost:3000',
				changeOrigin: true,
				secure: false,
			},
			'/ws': {
				target: 'ws://localhost:3000',
				ws: true,
			},
		},

		headers: {
			'Cache-Control': 'public, max-age=31536000',
		},
	},
});
