import { $ } from "./dom";

// 自行查詢其他股票的歷史報酬率/波動度(開新分頁,查到後手動填回上方欄位)
// 台股代號純數字風格跟港股/陸股代號重疊,無法自動判斷,改由使用者選市場
// 陸股代號開頭 6 為上海(.SS),0 或 3 為深圳(.SZ)
function openLookup(): void {
  const code = $<HTMLInputElement>("lookupCode").value.trim();
  if (!code) return;
  const market = $<HTMLSelectElement>("lookupMarket").value;
  let url: string;
  if (market === "TW") url = `https://info.ifa.ai/tw-stock/${encodeURIComponent(code)}`;
  else if (market === "HK")
    url = `https://finance.yahoo.com/quote/${encodeURIComponent(code.padStart(4, "0"))}.HK`;
  else if (market === "CN")
    url = `https://finance.yahoo.com/quote/${encodeURIComponent(code)}.${
      code.startsWith("6") ? "SS" : "SZ"
    }`;
  else url = `https://finance.yahoo.com/quote/${encodeURIComponent(code.toUpperCase())}`;
  window.open(url, "_blank", "noopener");
}

export function initLookup(): void {
  $("lookupBtn").addEventListener("click", openLookup);
  $("lookupCode").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !$<HTMLButtonElement>("lookupBtn").disabled) openLookup();
  });
  $("lookupCode").addEventListener("input", () => {
    $<HTMLButtonElement>("lookupBtn").disabled = $<HTMLInputElement>("lookupCode").value.trim() === "";
  });
}
