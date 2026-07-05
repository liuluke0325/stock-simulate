export type Currency = "TWD" | "USD" | "HKD" | "CNY";
export type Mode = "theory" | "sim";

export interface Point {
  m: number;
  value: number;
}

export interface SimPoint extends Point {
  invested: number;
  gain: number;
}

export interface CustomPreset {
  name: string;
  rate: number;
  vol: number;
  ccy: Currency;
}
