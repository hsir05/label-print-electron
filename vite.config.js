import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
import react from "@vitejs/plugin-react-swc";
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    base: './', // 部署应用时的基本URL
    build: {
        outDir: 'dist', // 输出目录
        assetsDir: 'assets', // 静态资源目录
        sourcemap: true, // 生成 source map 文件
        rollupOptions: {
            output: {
                // 自定义输出配置
            }
        }
    }
});