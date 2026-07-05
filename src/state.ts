import type { Currency, Mode, Point, SimPoint } from "./types";

// 集中管理跨模組共用的可變狀態,其他模組只透過這裡的 setter 修改
export let currency: Currency = "TWD"; // 由選擇的標的(台股/美股/港股/陸股)決定
export let mode: Mode = "theory"; // 目前顯示中的分頁
export let data: SimPoint[] = []; // 模擬路徑(含隨機漲跌與突發事件)
export let theoData: Point[] = []; // 理論平均值(單純複利,無波動)

export function setCurrency(c: Currency) {
  currency = c;
}
export function setMode(m: Mode) {
  mode = m;
}
export function setSeries(sim: SimPoint[], theo: Point[]) {
  data = sim;
  theoData = theo;
}

export const CCY_SYMBOL: Record<Currency, string> = {
  TWD: "NT$",
  USD: "US$",
  HKD: "HK$",
  CNY: "¥",
};
// 萬/億(台、中) vs K/M/B(美、港)
export const CCY_UNIT_WAN: Record<Currency, boolean> = {
  TWD: true,
  CNY: true,
  USD: false,
  HKD: false,
};
