import { defineConfig } from "vite";

// GitHub Pages 服務在 /stock-simulate/ 這個子路徑下,build 出來的資源路徑要對齊
export default defineConfig({
  base: "/stock-simulate/",
});
