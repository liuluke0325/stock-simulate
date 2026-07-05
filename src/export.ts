import * as XLSX from "xlsx";
import { $ } from "./dom";
import { data, theoData, currency, CCY_SYMBOL } from "./state";

// 匯出 Excel:仿照試算表慣用的「指標為列、時間點為欄」寬表格式,方便直接在 Excel 裡繼續加工
function exportExcel(): void {
  const ageStr = $<HTMLInputElement>("age").value.trim();
  const age = ageStr !== "" ? +ageStr : null;
  const lastM = data.length - 1;
  const checkpoints: number[] = [];
  for (let m = 0; m <= lastM; m += 12) checkpoints.push(m);
  if (checkpoints[checkpoints.length - 1] !== lastM) checkpoints.push(lastM);

  const rows: (string | number)[][] = [];
  rows.push(["股票複利試算 — 匯出資料"]);
  rows.push(["匯出時間", new Date().toLocaleString("zh-TW")]);
  rows.push(["期初本金", +$<HTMLInputElement>("principal").value, CCY_SYMBOL[currency]]);
  rows.push(["每月投入", +$<HTMLInputElement>("monthly").value, CCY_SYMBOL[currency] + "/月"]);
  rows.push(["年化報酬率(%)", +$<HTMLInputElement>("rate").value]);
  rows.push(["年化波動度(%,模擬分頁用)", +$<HTMLInputElement>("vol").value]);
  if (age !== null) rows.push(["目前年齡", age]);
  rows.push([]);

  const headRow: (string | number)[] = [age !== null ? "年齡" : "月數"];
  const investedRow: (string | number)[] = ["累計投入"];
  const theoRow: (string | number)[] = ["理論總值(單純複利)"];
  const simRow: (string | number)[] = ["模擬總值(卜瓦松模擬,本次結果)"];
  const gainRow: (string | number)[] = ["模擬損益"];
  checkpoints.forEach((m) => {
    headRow.push(age !== null ? +(age + m / 12).toFixed(1) : m);
    investedRow.push(Math.round(data[m].invested));
    theoRow.push(Math.round(theoData[m].value));
    simRow.push(Math.round(data[m].value));
    gainRow.push(Math.round(data[m].value - data[m].invested));
  });
  rows.push(headRow, investedRow, theoRow, simRow, gainRow);

  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "試算結果");
  XLSX.writeFile(wb, "股票複利試算.xlsx");
}

export function initExport(): void {
  $<HTMLButtonElement>("exportBtn").addEventListener("click", () => {
    exportExcel();
    // 下載是瀏覽器默默完成的,沒有這個提示使用者會以為按了沒反應
    const btn = $<HTMLButtonElement>("exportBtn");
    const original = btn.textContent;
    btn.textContent = "✓ 已下載到 Downloads";
    setTimeout(() => {
      btn.textContent = original;
    }, 1800);
  });
}
