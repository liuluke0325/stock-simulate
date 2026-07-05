import "./style.css";
import { $ } from "./dom";
import type { Mode } from "./types";
import { mode, setMode, setSeries, data, theoData } from "./state";
import { fmtFull } from "./format";
import { computeTheoretical, computeSimulated } from "./finance";
import { drawChart, hover, hoverEnd } from "./chart";
import { initPresets } from "./presets";
import { initLookup } from "./lookup";
import { initExport } from "./export";
import { initTheme } from "./theme";

function compute(): void {
  const P = Math.max(0, +$<HTMLInputElement>("principal").value || 0);
  const C = Math.max(0, +$<HTMLInputElement>("monthly").value || 0);
  const a = Math.max(0, +$<HTMLInputElement>("rate").value || 0) / 100;
  const vol = Math.max(0, +$<HTMLInputElement>("vol").value || 0) / 100;
  const M = +$<HTMLInputElement>("months").value;

  const inputs = { principal: P, monthly: C, annualRate: a, annualVol: vol, months: M };
  setSeries(computeSimulated(inputs), computeTheoretical(inputs));

  const yr = Math.floor(M / 12),
    mo = M % 12;
  $("mLabel").innerHTML =
    M + " 個月" + (M >= 12 ? ` <small>(約 ${yr} 年${mo ? ` ${mo} 個月` : ""})</small>` : "");

  render();
}

function render(): void {
  const lastSim = data[data.length - 1];
  const lastTheo = theoData[theoData.length - 1];
  const invested = lastSim.invested;

  if (mode === "theory") {
    $("lblVal").textContent = "期末總值";
    $("lblGain").textContent = "複利獲利";
    $("lblRoi").textContent = "報酬率";
    $("legendValLabel").textContent = "複利總值";
    $("sVal").textContent = fmtFull(lastTheo.value);
    $("sGain").textContent = fmtFull(lastTheo.value - invested);
    $("sRoi").textContent =
      "+" + (invested > 0 ? (((lastTheo.value - invested) / invested) * 100).toFixed(1) : "0.0") + " %";
  } else {
    $("lblVal").textContent = "期末總值(本次模擬)";
    $("lblGain").textContent = "模擬損益";
    $("lblRoi").textContent = "模擬報酬率";
    $("legendValLabel").textContent = "模擬路徑(隨機漲跌)";
    $("sVal").textContent = fmtFull(lastSim.value);
    $("sGain").textContent = fmtFull(lastSim.gain);
    $("sRoi").textContent = "+" + (invested > 0 ? ((lastSim.gain / invested) * 100).toFixed(1) : "0.0") + " %";
  }
  $("sInv").textContent = fmtFull(invested);
  $("sTheo").textContent = fmtFull(lastTheo.value);
  $("statTheoCard").style.display = mode === "sim" ? "" : "none";
  $("reroll").style.display = mode === "sim" ? "" : "none";
  $("legendTheoLine").style.display = mode === "sim" ? "" : "none";
  $("explainer").style.display = mode === "sim" ? "" : "none";
  $("volField").style.display = mode === "sim" ? "" : "none";
  $("customVol").style.display = mode === "sim" ? "" : "none";

  drawChart();
}

function initTabs(): void {
  document.querySelectorAll<HTMLButtonElement>(".tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      setMode((btn.dataset.mode as Mode) || "theory");
      render();
    });
  });
}

function initChartInteraction(): void {
  const chart = $("chart");
  chart.addEventListener("mousemove", hover);
  chart.addEventListener("mouseleave", hoverEnd);
  chart.addEventListener(
    "touchmove",
    (e) => {
      e.preventDefault();
      hover(e);
    },
    { passive: false }
  );
  chart.addEventListener("touchend", hoverEnd);
}

initTabs();
initChartInteraction();
initPresets(compute);
initLookup();
initExport();
initTheme();

["principal", "monthly", "rate", "vol", "months"].forEach((id) => $(id).addEventListener("input", compute));
$("reroll").addEventListener("click", compute);
window.addEventListener("resize", drawChart);

compute();
