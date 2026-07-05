import { $ } from "./dom";
import { data, theoData, mode } from "./state";
import { fmtFull, fmtShort } from "./format";

interface ChartGeo {
  x: (m: number) => number;
  y: (v: number) => number;
  padL: number;
  iw: number;
  M: number;
}
interface ChartSvg extends SVGSVGElement {
  _geo?: ChartGeo;
}

export function drawChart(): void {
  const svg = $<ChartSvg>("chart");
  const cs = getComputedStyle(document.documentElement);
  const cLine = cs.getPropertyValue("--line").trim();
  const cDim = cs.getPropertyValue("--dim").trim();
  const cRed = cs.getPropertyValue("--red").trim();
  const cGold = cs.getPropertyValue("--gold").trim();
  const W = svg.clientWidth || 800,
    H = 360;
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  const padL = 74,
    padR = 14,
    padT = 14,
    padB = 32;
  const iw = W - padL - padR,
    ih = H - padT - padB;
  const M = theoData.length - 1;
  const maxY =
    (mode === "sim"
      ? Math.max(...data.map((d) => d.value), ...theoData.map((d) => d.value), 1)
      : Math.max(...theoData.map((d) => d.value), 1)) * 1.05;

  const x = (m: number) => padL + (m / M) * iw;
  const y = (v: number) => padT + ih - (v / maxY) * ih;

  let s = "";
  // 格線 + Y 軸標籤
  for (let i = 0; i <= 4; i++) {
    const v = (maxY * i) / 4,
      yy = y(v);
    s += `<line x1="${padL}" y1="${yy}" x2="${W - padR}" y2="${yy}" stroke="${cLine}" stroke-dasharray="3 3"/>`;
    s += `<text x="${padL - 10}" y="${yy + 5}" fill="${cDim}" font-size="14" text-anchor="end">${fmtShort(v)}</text>`;
  }
  // X 軸年標籤
  const yrStep = M >= 240 ? 60 : M >= 120 ? 24 : M >= 48 ? 12 : M >= 12 ? 6 : 1;
  for (let m = 0; m <= M; m += yrStep) {
    s += `<text x="${x(m)}" y="${H - 10}" fill="${cDim}" font-size="14" text-anchor="middle">${
      m % 12 === 0 && m > 0 ? m / 12 + "年" : m
    }</text>`;
  }

  const pInvested = data.map((d) => `${x(d.m)},${y(d.invested)}`).join(" ");
  const mainSeries = mode === "sim" ? data : theoData;
  const pMain = mainSeries.map((d) => `${x(d.m)},${y(d.value)}`).join(" ");

  s += `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="${cRed}" stop-opacity="0.3"/>
    <stop offset="100%" stop-color="${cRed}" stop-opacity="0"/></linearGradient></defs>`;
  if (mode === "sim") {
    const pTheo = theoData.map((d) => `${x(d.m)},${y(d.value)}`).join(" ");
    s += `<polyline points="${pTheo}" fill="none" stroke="${cDim}" stroke-width="2" stroke-dasharray="2 5" opacity="0.9"/>`;
  }
  s += `<polyline points="${pInvested}" fill="none" stroke="${cGold}" stroke-width="2" stroke-dasharray="4 3"/>`;
  s += `<polygon points="${x(0)},${y(0)} ${pMain} ${x(M)},${y(0)}" fill="url(#g)"/>`;
  s += `<polyline points="${pMain}" fill="none" stroke="${cRed}" stroke-width="2.5"/>`;
  s += `<g id="hover" style="display:none">
    <line id="hLine" y1="${padT}" y2="${padT + ih}" stroke="${cDim}" stroke-width="1.5"/>
    <circle id="hDot" r="5" fill="${cRed}"/></g>`;
  svg.innerHTML = s;
  svg._geo = { x, y, padL, iw, M };
}

// 圖表上直接拖拉/移動查看任一月份
function pointerXY(evt: MouseEvent | TouchEvent): { x: number; y: number } {
  if ("touches" in evt && evt.touches.length) {
    return { x: evt.touches[0].clientX, y: evt.touches[0].clientY };
  }
  const e = evt as MouseEvent;
  return { x: e.clientX, y: e.clientY };
}

export function hover(evt: MouseEvent | TouchEvent): void {
  const svg = $<ChartSvg>("chart");
  const g = svg._geo;
  if (!g) return;
  const tip = $("tip");
  const rect = svg.getBoundingClientRect();
  const { x: cx, y: cy } = pointerXY(evt);
  const px = cx - rect.left;
  const viewBoxWidth = svg.viewBox.baseVal.width || rect.width;
  const scale = rect.width / viewBoxWidth;
  const m = Math.round(Math.min(Math.max((px / scale - g.padL) / g.iw, 0), 1) * g.M);
  const dSim = data[m],
    dTheo = theoData[m];
  const mainVal = mode === "sim" ? dSim.value : dTheo.value;
  const hv = svg.querySelector<SVGGElement>("#hover");
  if (!hv) return;
  hv.style.display = "";
  const hx = g.x(m);
  svg.querySelector("#hLine")?.setAttribute("x1", String(hx));
  svg.querySelector("#hLine")?.setAttribute("x2", String(hx));
  const dot = svg.querySelector("#hDot");
  dot?.setAttribute("cx", String(hx));
  dot?.setAttribute("cy", String(g.y(mainVal)));
  tip.style.display = "block";
  tip.style.left = Math.min(cx + 14, window.innerWidth - 190) + "px";
  tip.style.top = cy - 10 + "px";
  if (mode === "sim") {
    tip.innerHTML =
      `第 ${m} 個月<br>` +
      `<span style="color:var(--red)">模擬總值 ${fmtFull(dSim.value)}</span><br>` +
      `<span style="color:var(--dim)">理論對照 ${fmtFull(dTheo.value)}</span><br>` +
      `<span style="color:var(--gold)">累計投入 ${fmtFull(dSim.invested)}</span><br>` +
      `損益 ${fmtFull(dSim.value - dSim.invested)}`;
  } else {
    tip.innerHTML =
      `第 ${m} 個月<br>` +
      `<span style="color:var(--red)">複利總值 ${fmtFull(dTheo.value)}</span><br>` +
      `<span style="color:var(--gold)">累計投入 ${fmtFull(dSim.invested)}</span><br>` +
      `獲利 ${fmtFull(dTheo.value - dSim.invested)}`;
  }
}

export function hoverEnd(): void {
  $("tip").style.display = "none";
  const hv = $<ChartSvg>("chart").querySelector<SVGGElement>("#hover");
  if (hv) hv.style.display = "none";
}
