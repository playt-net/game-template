import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [react(), tailwindcss(), tsconfigPaths()],
	publicDir: "public",
	define: {
		"import.meta.env.npm_package_version": `"${process.env.npm_package_version}"`,
	},
	build: {
		outDir: "dist",
		emptyOutDir: true,
		minify: true,
		cssMinify: true,
		rollupOptions: {
			output: {
				manualChunks: {
					phaser: ["phaser"],
				},
			},
		},
	},
	server: {
		port: 8000,
		open: "/?playerToken=123&gameId=123&mute=true",
		host: true,
		proxy: {
			"/api": {
				target: "http://localhost:3000",
				changeOrigin: true,
				secure: false,
			},
			"/ws": {
				target: "ws://localhost:3000",
				ws: true,
			},
		},

		headers: {
			"Cache-Control": "public, max-age=31536000",
		},
	},
});
