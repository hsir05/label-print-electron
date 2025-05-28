import { cwd } from "process";
import path from "path";
import { builtinModules } from "module";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import electron from 'vite-plugin-electron'

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const sharedResolve = {
    alias: {
        "@": path.resolve(__dirname, "../src"),
    },
};

export default defineConfig({
    root: path.resolve(__dirname, "../src/main"),
    envDir: cwd(),
    resolve: sharedResolve,
    plugins: [
        electron({
            entry: path.resolve(__dirname, "../src/main/index.ts"), // 你的 Electron 主进程入口文件
        }),
    ],
    build: {
        outDir: path.resolve(__dirname, "../dist/main"),
        minify: false,
        sourcemap: true,
        watch: {},
        lib: {
            entry: path.resolve(__dirname, "../src/main/index.ts"),
            formats: ["cjs"],
        },
        rollupOptions: {
            external: [
                "electron",
                "sqlite3",
                ...builtinModules,
            ],
            output: {
                entryFileNames: "[name].cjs",
            },
        },
        emptyOutDir: true,
        chunkSizeWarningLimit: 2048,
    },
})
