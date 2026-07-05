import type { Point, SimPoint } from "./types";

// 標準常態分布亂數(Box-Muller),用於模擬每月報酬的隨機波動
export function randNormal(): number {
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// 卜瓦松分布亂數,用於模擬「市場突發事件」(急跌/急漲)在單月內發生的次數
export function randPoisson(lambda: number): number {
  if (lambda <= 0) return 0;
  const L = Math.exp(-lambda);
  let k = 0,
    p = 1;
  do {
    k++;
    p *= Math.random();
  } while (p > L);
  return k - 1;
}

// 市場突發事件參數:平均每年約 1.5 次,幅度略偏負(反映市場「跌快漲慢」的現實特性)
export const JUMP_LAMBDA_YEAR = 1.5;
export const JUMP_MEAN = -0.02;
export const JUMP_STD = 0.05;

export interface SimInputs {
  principal: number;
  monthly: number;
  annualRate: number; // 0.08 = 8%
  annualVol: number; // 0.20 = 20%
  months: number;
}

export function computeTheoretical({ principal, monthly, annualRate, months }: SimInputs): Point[] {
  const r = Math.pow(1 + annualRate, 1 / 12) - 1;
  const theoData: Point[] = [];
  for (let m = 0; m <= months; m++) {
    const g = Math.pow(1 + r, m);
    const value = r === 0 ? principal + monthly * m : principal * g + monthly * ((g - 1) / r);
    theoData.push({ m, value });
  }
  return theoData;
}

// 模擬路徑:每月報酬 = 常態波動 + 卜瓦松過程模擬的突發漲跌,呈現真實股市上上下下的走勢
export function computeSimulated({ principal, monthly, annualRate, annualVol, months }: SimInputs): SimPoint[] {
  const sigmaM = annualVol / Math.sqrt(12);
  const lambdaM = JUMP_LAMBDA_YEAR / 12;
  // 扣掉突發事件本身帶來的期望值偏移,確保平均而言仍貼齊使用者輸入的年化報酬率
  // (波動只放大分散度,不應該偷偷拉低平均值)
  const jumpDrag = lambdaM * (Math.exp(JUMP_MEAN + 0.5 * JUMP_STD * JUMP_STD) - 1);
  const muM = Math.log(1 + annualRate) / 12 - 0.5 * sigmaM * sigmaM - jumpDrag;

  const data: SimPoint[] = [{ m: 0, value: principal, invested: principal, gain: 0 }];
  let v = principal;
  for (let m = 1; m <= months; m++) {
    let logRet = muM + sigmaM * randNormal();
    const nJumps = randPoisson(lambdaM);
    for (let j = 0; j < nJumps; j++) logRet += JUMP_MEAN + JUMP_STD * randNormal();
    v = v * Math.exp(logRet) + monthly;
    v = Math.max(v, 0);
    const invested = principal + monthly * m;
    data.push({ m, value: v, invested, gain: v - invested });
  }
  return data;
}
