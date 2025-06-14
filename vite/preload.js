import { cwd } from "process";
import path from "path";
import { builtinModules } from "module";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";

const __dirname = fileURLToPath(new URL(".", import.meta.url));


const sharedResolve = {
    alias: {
        "@": path.resolve(__dirname, "../src"),
    },
};



export default defineConfig({
    root: path.resolve(__dirname, "../src/preload"),
    // envDir: cwd(),
    base: './',
    resolve: sharedResolve,
    build: {
        outDir: path.resolve(__dirname, "../dist/preload"),
        assetsDir: 'assets', // 静态资源目录
        // emptyOutDir: true, // 打包前清空 dist
        sourcemap: true,
        minify: false,
        watch: {},
        lib: {
            entry: path.resolve(__dirname, "../src/preload/index.ts"),
            formats: ["cjs"],
        },
        rollupOptions: {
            external: ["electron", ...builtinModules],
            output: {
                entryFileNames: "[name].cjs",
            }
        },
        emptyOutDir: true,
        chunkSizeWarningLimit: 2048,
    },
});

