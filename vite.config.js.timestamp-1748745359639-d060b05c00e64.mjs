// vite.config.js
import { defineConfig } from "file:///D:/space/electron-proplay-feature-db/node_modules/.pnpm/vite@5.4.19_@types+node@20.17.50_less@4.3.0/node_modules/vite/dist/node/index.js";
import react from "file:///D:/space/electron-proplay-feature-db/node_modules/.pnpm/@vitejs+plugin-react-swc@3.10.0_vite@5.4.19_@types+node@20.17.50_less@4.3.0_/node_modules/@vitejs/plugin-react-swc/index.mjs";
var vite_config_default = defineConfig({
  plugins: [react()],
  base: "./",
  // 部署应用时的基本URL
  build: {
    outDir: "dist",
    // 输出目录
    assetsDir: "assets",
    // 静态资源目录
    // minify: 'terser', // 使用 terser 进行代码压缩
    sourcemap: true,
    // 生产环境关闭 sourcemap
    chunkSizeWarningLimit: 1e3,
    // 调整 chunk 大小警告限制
    rollupOptions: {
      output: {
        // 自定义输出配置
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxzcGFjZVxcXFxlbGVjdHJvbi1wcm9wbGF5LWZlYXR1cmUtZGJcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXHNwYWNlXFxcXGVsZWN0cm9uLXByb3BsYXktZmVhdHVyZS1kYlxcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovc3BhY2UvZWxlY3Ryb24tcHJvcGxheS1mZWF0dXJlLWRiL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0LXN3Y1wiO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICAgIHBsdWdpbnM6IFtyZWFjdCgpXSxcbiAgICBiYXNlOiAnLi8nLCAvLyBcdTkwRThcdTdGNzJcdTVFOTRcdTc1MjhcdTY1RjZcdTc2ODRcdTU3RkFcdTY3MkNVUkxcbiAgICBidWlsZDoge1xuICAgICAgICBvdXREaXI6ICdkaXN0JywgLy8gXHU4RjkzXHU1MUZBXHU3NkVFXHU1RjU1XG4gICAgICAgIGFzc2V0c0RpcjogJ2Fzc2V0cycsIC8vIFx1OTc1OVx1NjAwMVx1OEQ0NFx1NkU5MFx1NzZFRVx1NUY1NVxuICAgICAgICAvLyBtaW5pZnk6ICd0ZXJzZXInLCAvLyBcdTRGN0ZcdTc1MjggdGVyc2VyIFx1OEZEQlx1ODg0Q1x1NEVFM1x1NzgwMVx1NTM4Qlx1N0YyOVxuICAgICAgICBzb3VyY2VtYXA6IHRydWUsIC8vIFx1NzUxRlx1NEVBN1x1NzNBRlx1NTg4M1x1NTE3M1x1OTVFRCBzb3VyY2VtYXBcbiAgICAgICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiAxMDAwLCAvLyBcdThDMDNcdTY1NzQgY2h1bmsgXHU1OTI3XHU1QzBGXHU4QjY2XHU1NDRBXHU5NjUwXHU1MjM2XG4gICAgICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgICAgICAgIG91dHB1dDoge1xuICAgICAgICAgICAgICAgIC8vIFx1ODFFQVx1NUI5QVx1NEU0OVx1OEY5M1x1NTFGQVx1OTE0RFx1N0Y2RVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufSk7Il0sCiAgIm1hcHBpbmdzIjogIjtBQUFvUyxTQUFTLG9CQUFvQjtBQUNqVSxPQUFPLFdBQVc7QUFFbEIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDeEIsU0FBUyxDQUFDLE1BQU0sQ0FBQztBQUFBLEVBQ2pCLE1BQU07QUFBQTtBQUFBLEVBQ04sT0FBTztBQUFBLElBQ0gsUUFBUTtBQUFBO0FBQUEsSUFDUixXQUFXO0FBQUE7QUFBQTtBQUFBLElBRVgsV0FBVztBQUFBO0FBQUEsSUFDWCx1QkFBdUI7QUFBQTtBQUFBLElBQ3ZCLGVBQWU7QUFBQSxNQUNYLFFBQVE7QUFBQTtBQUFBLE1BRVI7QUFBQSxJQUNKO0FBQUEsRUFDSjtBQUNKLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
