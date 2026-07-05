import { currency, CCY_SYMBOL, CCY_UNIT_WAN } from "./state";

export function fmtFull(n: number): string {
  return (
    CCY_SYMBOL[currency] +
    " " +
    Math.round(n).toLocaleString(CCY_UNIT_WAN[currency] ? "zh-TW" : "en-US")
  );
}

export function fmtShort(n: number): string {
  if (!CCY_UNIT_WAN[currency]) {
    if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
    if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
    if (n >= 1e3) return Math.round(n / 1e3) + "K";
    return Math.round(n).toLocaleString();
  }
  if (n >= 1e8) return (n / 1e8).toFixed(1) + "億";
  if (n >= 1e4) return Math.round(n / 1e4).toLocaleString() + "萬";
  return Math.round(n).toLocaleString();
}
