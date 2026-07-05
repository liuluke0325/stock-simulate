import { $ } from "./dom";
import { data } from "./state";
import { drawChart } from "./chart";

// 深色/淺色主題切換,記在 localStorage 下次還記得
const THEME_KEY = "stockSim.theme";

function applyTheme(t: string): void {
  document.documentElement.setAttribute("data-theme", t);
  $("themeToggle").textContent = t === "light" ? "🌙" : "☀️";
  localStorage.setItem(THEME_KEY, t);
  // 切換主題只重畫顏色,不重新模擬(初次載入時 data 還沒算好,交給後面的 compute() 畫)
  if (data.length) drawChart();
}

export function initTheme(): void {
  $("themeToggle").addEventListener("click", () => {
    const cur = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
    applyTheme(cur === "light" ? "dark" : "light");
  });
  applyTheme(localStorage.getItem(THEME_KEY) || "dark");
}
