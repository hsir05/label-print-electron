import { defineConfig } from 'vite';
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
    plugins: [react()],
    base: './', // 部署应用时的基本URL
    build: {
        outDir: 'dist', // 输出目录
        assetsDir: 'assets', // 静态资源目录
        // minify: 'terser', // 使用 terser 进行代码压缩
        sourcemap: true, // 生产环境关闭 sourcemap
        chunkSizeWarningLimit: 1000, // 调整 chunk 大小警告限制
        // emptyOutDir: false,
        extraFiles: [
            "node_modules/sqlite3/**/*"
        ],
        rollupOptions: {
            // external: [
            //     "electron",
            //     "sqlite3",
            // ],
            output: {
                // entryFileNames: "[name].cjs",
            },
        },
    }
});