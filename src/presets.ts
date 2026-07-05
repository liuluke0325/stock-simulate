import { $ } from "./dom";
import type { Currency, CustomPreset } from "./types";
import { setCurrency, CCY_UNIT_WAN, mode } from "./state";
import { PRESET_NOTES } from "./presetNotes";

const CUSTOM_KEY = "stockSim.customPresets";

// 自訂標的:存在瀏覽器 localStorage,重新整理、下次再開都還在
function loadCustomPresets(): CustomPreset[] {
  try {
    return JSON.parse(localStorage.getItem(CUSTOM_KEY) || "[]") as CustomPreset[];
  } catch {
    return [];
  }
}
function saveCustomPresets(list: CustomPreset[]): void {
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(list));
}
function renderCustomPresets(): void {
  const list = loadCustomPresets();
  const row = $("customRow");
  row.innerHTML =
    `<span class="cap">我的自訂標的:</span>` +
    list
      .map(
        (p, i) =>
          `<button class="pill" data-rate="${p.rate}" data-vol="${p.vol}" data-ccy="${p.ccy}">${p.name}<span class="pill-del" data-idx="${i}"> ×</span></button>`
      )
      .join("");
  row.style.display = list.length ? "" : "none";
}

export function clearPillActive(): void {
  document.querySelectorAll(".pill").forEach((b) => b.classList.remove("active"));
}

function selectPill(btn: HTMLElement, onSelect: () => void): void {
  clearPillActive();
  btn.classList.add("active");
  $<HTMLInputElement>("rate").value = btn.dataset.rate ?? "";
  $<HTMLInputElement>("vol").value = btn.dataset.vol ?? "";
  const ccy = (btn.dataset.ccy as Currency) || "TWD";
  setCurrency(ccy);
  $("principalSuffix").textContent = CCY_UNIT_WAN[ccy] ? "元" : "$";
  $("monthlySuffix").textContent = CCY_UNIT_WAN[ccy] ? "元/月" : "$/月";
  updatePresetNote(btn.dataset.key);
  onSelect();
}

// 只顯示目前選中標的的資料來源/注意事項,而不是把所有標的的說明都列在頁尾
function updatePresetNote(key: string | undefined): void {
  const box = $("presetNote");
  const note = key ? PRESET_NOTES[key] : undefined;
  if (note) {
    box.innerHTML = note;
    box.style.display = "";
  } else {
    box.style.display = "none";
  }
}

// 熱門標的:點選帶入該標的的年化報酬率/波動度示意值(台股/美股各自的幣別也一併切換)
// 用事件代理綁在容器上,這樣動態新增的「自訂標的」按鈕也會自動生效,不用重新綁定
export function initPresets(onSelect: () => void): void {
  renderCustomPresets();

  $("allPresets").addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    const del = target.closest<HTMLElement>(".pill-del");
    if (del) {
      e.stopPropagation();
      const idx = Number(del.dataset.idx);
      const list = loadCustomPresets();
      list.splice(idx, 1);
      saveCustomPresets(list);
      renderCustomPresets();
      return;
    }
    const btn = target.closest<HTMLElement>(".pill");
    if (btn) selectPill(btn, onSelect);
  });

  // 波動度只有「模擬」分頁才用得到,理論分頁新增自訂標的時不強制填,沿用目前波動度欄位的值當預設
  function updateCustomAddBtn(): void {
    const name = $<HTMLInputElement>("customName").value.trim();
    const rateStr = $<HTMLInputElement>("customRate").value;
    const volStr = $<HTMLInputElement>("customVol").value;
    const ok =
      name !== "" &&
      rateStr !== "" &&
      !isNaN(+rateStr) &&
      (mode === "theory" || (volStr !== "" && !isNaN(+volStr)));
    $<HTMLButtonElement>("customAddBtn").disabled = !ok;
  }
  ["customName", "customRate", "customVol"].forEach((id) =>
    $(id).addEventListener("input", updateCustomAddBtn)
  );
  $("customAddBtn").addEventListener("click", () => {
    const name = $<HTMLInputElement>("customName").value.trim();
    const rate = +$<HTMLInputElement>("customRate").value;
    const customVolStr = $<HTMLInputElement>("customVol").value;
    const vol = customVolStr !== "" ? +customVolStr : +$<HTMLInputElement>("vol").value;
    if (!name || isNaN(rate) || isNaN(vol)) return;
    const list = loadCustomPresets();
    list.push({ name, rate, vol, ccy: $<HTMLSelectElement>("customCcy").value as Currency });
    saveCustomPresets(list);
    renderCustomPresets();
    $<HTMLInputElement>("customName").value = "";
    $<HTMLInputElement>("customRate").value = "";
    $<HTMLInputElement>("customVol").value = "";
    updateCustomAddBtn();
  });

  $("rate").addEventListener("input", clearPillActive);
  $("vol").addEventListener("input", clearPillActive);
}
