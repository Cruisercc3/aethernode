// ─── Comprehensive Indicator Library ───────────────────────────────
// Covers all indicators available on major exchanges (Binance/Bybit)

import type { UTCTimestamp } from "lightweight-charts"

export interface CandleData {
  time: UTCTimestamp
  open: number
  high: number
  low: number
  close: number
  volume?: number
}

export type IndicatorCategory = "overlay" | "pane"
export type IndicatorGroup = "Trend" | "Momentum" | "Volume" | "Volatility" | "Oscillator"

export interface IndicatorDefinition {
  type: string
  label: string
  description: string
  category: IndicatorCategory
  group: IndicatorGroup
  defaultParams: Record<string, number | string>
  defaultColor: string
  /** Additional colors for multi-line indicators */
  extraColors?: Record<string, string>
  /** Parameter labels for the settings dialog */
  paramLabels?: Record<string, string>
}

export interface ActiveIndicator {
  id: string
  type: string
  params: Record<string, number | string>
  color?: string
  extraColors?: Record<string, string>
  visible?: boolean
  lineWidth?: number
}

// ─── Full Indicator Definitions ─────────────────────────────────

export const INDICATOR_DEFINITIONS: IndicatorDefinition[] = [
  // ── Trend (Overlay) ──
  { type: "SMA", label: "SMA", description: "Simple Moving Average", category: "overlay", group: "Trend", defaultParams: { period: 20, source: "close" }, defaultColor: "#2196F3", paramLabels: { period: "Length", source: "Source" } },
  { type: "EMA", label: "EMA", description: "Exponential Moving Average", category: "overlay", group: "Trend", defaultParams: { period: 20, source: "close" }, defaultColor: "#FF6D00", paramLabels: { period: "Length", source: "Source" } },
  { type: "WMA", label: "WMA", description: "Weighted Moving Average", category: "overlay", group: "Trend", defaultParams: { period: 20 }, defaultColor: "#00BCD4", paramLabels: { period: "Length" } },
  { type: "DEMA", label: "DEMA", description: "Double Exponential Moving Average", category: "overlay", group: "Trend", defaultParams: { period: 20 }, defaultColor: "#8BC34A", paramLabels: { period: "Length" } },
  { type: "TEMA", label: "TEMA", description: "Triple Exponential Moving Average", category: "overlay", group: "Trend", defaultParams: { period: 20 }, defaultColor: "#CDDC39", paramLabels: { period: "Length" } },
  { type: "KAMA", label: "KAMA", description: "Kaufman Adaptive Moving Average", category: "overlay", group: "Trend", defaultParams: { period: 10, fastPeriod: 2, slowPeriod: 30 }, defaultColor: "#E91E63", paramLabels: { period: "Length", fastPeriod: "Fast Period", slowPeriod: "Slow Period" } },
  { type: "VWAP", label: "VWAP", description: "Volume Weighted Average Price", category: "overlay", group: "Trend", defaultParams: {}, defaultColor: "#9C27B0", paramLabels: {} },
  { type: "PSAR", label: "P-SAR", description: "Parabolic SAR", category: "overlay", group: "Trend", defaultParams: { afStep: 0.02, afMax: 0.2 }, defaultColor: "#FF9800", paramLabels: { afStep: "AF Step", afMax: "AF Max" } },
  { type: "SUPERTREND", label: "Supertrend", description: "Supertrend", category: "overlay", group: "Trend", defaultParams: { period: 10, multiplier: 3 }, defaultColor: "#4CAF50", extraColors: { down: "#ef4444" }, paramLabels: { period: "ATR Period", multiplier: "Multiplier" } },
  { type: "ICHIMOKU", label: "Ichimoku", description: "Ichimoku Cloud", category: "overlay", group: "Trend", defaultParams: { tenkan: 9, kijun: 26, senkou: 52 }, defaultColor: "#2196F3", extraColors: { kijun: "#ef4444", senkouA: "#4CAF50", senkouB: "#ef4444", chikou: "#9C27B0" }, paramLabels: { tenkan: "Tenkan Period", kijun: "Kijun Period", senkou: "Senkou Period" } },

  // ── Volatility (Overlay) ──
  { type: "BB", label: "BB", description: "Bollinger Bands", category: "overlay", group: "Volatility", defaultParams: { period: 20, stdDev: 2, offset: 0 }, defaultColor: "#FF6D00", extraColors: { upper: "#2196F3", lower: "#2196F3" }, paramLabels: { period: "Length", stdDev: "Mult", offset: "Offset" } },
  { type: "DONCHIAN", label: "Donchian", description: "Donchian Channels", category: "overlay", group: "Volatility", defaultParams: { period: 20 }, defaultColor: "#00BCD4", extraColors: { upper: "#00BCD4", lower: "#00BCD4" }, paramLabels: { period: "Length" } },
  { type: "KELTNER", label: "Keltner", description: "Keltner Channels", category: "overlay", group: "Volatility", defaultParams: { period: 20, multiplier: 1.5, atrPeriod: 10 }, defaultColor: "#AB47BC", extraColors: { upper: "#AB47BC", lower: "#AB47BC" }, paramLabels: { period: "Length", multiplier: "Multiplier", atrPeriod: "ATR Length" } },
  { type: "ENVELOPE", label: "Envelope", description: "Moving Average Envelope", category: "overlay", group: "Volatility", defaultParams: { period: 20, percentage: 2.5 }, defaultColor: "#607D8B", extraColors: { upper: "#607D8B", lower: "#607D8B" }, paramLabels: { period: "Length", percentage: "Percentage" } },

  // ── Momentum (Pane) ──
  { type: "RSI", label: "RSI", description: "Relative Strength Index", category: "pane", group: "Momentum", defaultParams: { period: 14, overbought: 70, oversold: 30 }, defaultColor: "#9C27B0", paramLabels: { period: "Length", overbought: "Overbought", oversold: "Oversold" } },
  { type: "MACD", label: "MACD", description: "Moving Average Convergence Divergence", category: "pane", group: "Momentum", defaultParams: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 }, defaultColor: "#2196F3", extraColors: { signal: "#FF6D00", histogram: "#26A69A" }, paramLabels: { fastPeriod: "Fast Length", slowPeriod: "Slow Length", signalPeriod: "Signal Smoothing" } },
  { type: "STOCH", label: "Stoch", description: "Stochastic Oscillator", category: "pane", group: "Momentum", defaultParams: { kPeriod: 14, kSmooth: 1, dSmooth: 3 }, defaultColor: "#2196F3", extraColors: { d: "#FF6D00" }, paramLabels: { kPeriod: "%K Length", kSmooth: "%K Smoothing", dSmooth: "%D Smoothing" } },
  { type: "STOCHRSI", label: "Stoch RSI", description: "Stochastic RSI", category: "pane", group: "Momentum", defaultParams: { rsiPeriod: 14, stochPeriod: 14, kSmooth: 3, dSmooth: 3 }, defaultColor: "#2196F3", extraColors: { d: "#FF6D00" }, paramLabels: { rsiPeriod: "RSI Length", stochPeriod: "Stoch Length", kSmooth: "K Smoothing", dSmooth: "D Smoothing" } },
  { type: "CCI", label: "CCI", description: "Commodity Channel Index", category: "pane", group: "Momentum", defaultParams: { period: 20 }, defaultColor: "#795548", paramLabels: { period: "Length" } },
  { type: "WILLIAMSR", label: "Williams %R", description: "Williams Percent Range", category: "pane", group: "Momentum", defaultParams: { period: 14 }, defaultColor: "#F44336", paramLabels: { period: "Length" } },
  { type: "ROC", label: "ROC", description: "Rate of Change", category: "pane", group: "Momentum", defaultParams: { period: 12 }, defaultColor: "#009688", paramLabels: { period: "Length" } },
  { type: "MOMENTUM", label: "Momentum", description: "Momentum", category: "pane", group: "Momentum", defaultParams: { period: 10 }, defaultColor: "#3F51B5", paramLabels: { period: "Length" } },
  { type: "AWESOME", label: "AO", description: "Awesome Oscillator", category: "pane", group: "Momentum", defaultParams: { fastPeriod: 5, slowPeriod: 34 }, defaultColor: "#4CAF50", extraColors: { down: "#ef4444" }, paramLabels: { fastPeriod: "Fast Period", slowPeriod: "Slow Period" } },
  { type: "TRIX", label: "TRIX", description: "Triple Exponential Average", category: "pane", group: "Momentum", defaultParams: { period: 18 }, defaultColor: "#00BCD4", paramLabels: { period: "Length" } },

  // ── Trend (Pane) ──
  { type: "ADX", label: "ADX", description: "Average Directional Index", category: "pane", group: "Trend", defaultParams: { period: 14 }, defaultColor: "#FF9800", extraColors: { plusDI: "#4CAF50", minusDI: "#ef4444" }, paramLabels: { period: "ADX Length" } },
  { type: "DMI", label: "DMI", description: "Directional Movement Index", category: "pane", group: "Trend", defaultParams: { period: 14 }, defaultColor: "#4CAF50", extraColors: { minusDI: "#ef4444" }, paramLabels: { period: "Length" } },

  // ── Volatility (Pane) ──
  { type: "ATR", label: "ATR", description: "Average True Range", category: "pane", group: "Volatility", defaultParams: { period: 14 }, defaultColor: "#FF5722", paramLabels: { period: "Length" } },

  // ── Volume (Pane) ──
  { type: "VOL", label: "Volume", description: "Volume", category: "pane", group: "Volume", defaultParams: {}, defaultColor: "#22c55e", extraColors: { falling: "#ef4444" }, paramLabels: {} },
  { type: "MFI", label: "MFI", description: "Money Flow Index", category: "pane", group: "Volume", defaultParams: { period: 14 }, defaultColor: "#4CAF50", paramLabels: { period: "Length" } },
  { type: "OBV", label: "OBV", description: "On-Balance Volume", category: "pane", group: "Volume", defaultParams: {}, defaultColor: "#2196F3", paramLabels: {} },
  { type: "CMF", label: "CMF", description: "Chaikin Money Flow", category: "pane", group: "Volume", defaultParams: { period: 20 }, defaultColor: "#00BCD4", paramLabels: { period: "Length" } },
  { type: "CHAIKIN", label: "Chaikin Osc", description: "Chaikin Oscillator", category: "pane", group: "Volume", defaultParams: { fastPeriod: 3, slowPeriod: 10 }, defaultColor: "#9C27B0", paramLabels: { fastPeriod: "Fast Period", slowPeriod: "Slow Period" } },
]

export function getIndicatorDef(type: string): IndicatorDefinition | undefined {
  return INDICATOR_DEFINITIONS.find((d) => d.type === type)
}

// ─── Helper: get source value ────────────────────────────────────
function getSource(d: CandleData, source: string = "close"): number {
  switch (source) {
    case "open": return d.open
    case "high": return d.high
    case "low": return d.low
    case "close": return d.close
    case "hl2": return (d.high + d.low) / 2
    case "hlc3": return (d.high + d.low + d.close) / 3
    case "ohlc4": return (d.open + d.high + d.low + d.close) / 4
    default: return d.close
  }
}

// ─── Calculation Functions ───────────────────────────────────────

type TimeValue = { time: UTCTimestamp; value: number }

// SMA
export function calcSMA(data: CandleData[], period: number, source = "close"): TimeValue[] {
  const result: TimeValue[] = []
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0
    for (let j = 0; j < period; j++) sum += getSource(data[i - j], source)
    result.push({ time: data[i].time, value: sum / period })
  }
  return result
}

// EMA (internal helper that works on raw values)
function emaValues(values: number[], period: number): number[] {
  const result: number[] = []
  const k = 2 / (period + 1)
  let ema = values.slice(0, period).reduce((s, v) => s + v, 0) / period
  for (let i = 0; i < values.length; i++) {
    if (i < period - 1) { result.push(NaN); continue }
    if (i === period - 1) { result.push(ema); continue }
    ema = values[i] * k + ema * (1 - k)
    result.push(ema)
  }
  return result
}

export function calcEMA(data: CandleData[], period: number, source = "close"): TimeValue[] {
  const values = data.map((d) => getSource(d, source))
  const ema = emaValues(values, period)
  return data.map((d, i) => ({ time: d.time, value: ema[i] })).filter((d) => !isNaN(d.value))
}

// WMA
export function calcWMA(data: CandleData[], period: number): TimeValue[] {
  const result: TimeValue[] = []
  const denom = (period * (period + 1)) / 2
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0
    for (let j = 0; j < period; j++) sum += data[i - j].close * (period - j)
    result.push({ time: data[i].time, value: sum / denom })
  }
  return result
}

// DEMA
export function calcDEMA(data: CandleData[], period: number): TimeValue[] {
  const ema1 = calcEMA(data, period)
  if (ema1.length < period) return []
  const fakeCandles = ema1.map((d) => ({ ...d, open: d.value, high: d.value, low: d.value, close: d.value }) as unknown as CandleData)
  const ema2 = calcEMA(fakeCandles, period)
  const ema1Map = new Map(ema1.map((d) => [d.time, d.value]))
  return ema2.map((d) => ({ time: d.time, value: 2 * (ema1Map.get(d.time) || d.value) - d.value }))
}

// TEMA
export function calcTEMA(data: CandleData[], period: number): TimeValue[] {
  const ema1 = calcEMA(data, period)
  if (ema1.length < period) return []
  const fakeCandles = (arr: TimeValue[]) => arr.map((d) => ({ ...d, open: d.value, high: d.value, low: d.value, close: d.value }) as unknown as CandleData)
  const ema2 = calcEMA(fakeCandles(ema1), period)
  const ema3 = calcEMA(fakeCandles(ema2), period)
  const map1 = new Map(ema1.map((d) => [d.time, d.value]))
  const map2 = new Map(ema2.map((d) => [d.time, d.value]))
  return ema3.map((d) => ({ time: d.time, value: 3 * (map1.get(d.time) || 0) - 3 * (map2.get(d.time) || 0) + d.value }))
}

// KAMA
export function calcKAMA(data: CandleData[], period: number, fastPeriod: number, slowPeriod: number): TimeValue[] {
  const result: TimeValue[] = []
  const fastSC = 2 / (fastPeriod + 1)
  const slowSC = 2 / (slowPeriod + 1)
  if (data.length <= period) return result
  let kama = data[period].close
  result.push({ time: data[period].time, value: kama })
  for (let i = period + 1; i < data.length; i++) {
    const direction = Math.abs(data[i].close - data[i - period].close)
    let volatility = 0
    for (let j = 0; j < period; j++) volatility += Math.abs(data[i - j].close - data[i - j - 1].close)
    const er = volatility === 0 ? 0 : direction / volatility
    const sc = Math.pow(er * (fastSC - slowSC) + slowSC, 2)
    kama = kama + sc * (data[i].close - kama)
    result.push({ time: data[i].time, value: kama })
  }
  return result
}

// VWAP
export function calcVWAP(data: CandleData[]): TimeValue[] {
  const result: TimeValue[] = []
  let cumVol = 0, cumTP = 0
  for (const d of data) {
    const tp = (d.high + d.low + d.close) / 3
    const vol = d.volume || 1
    cumVol += vol
    cumTP += tp * vol
    result.push({ time: d.time, value: cumTP / cumVol })
  }
  return result
}

// Parabolic SAR
export function calcPSAR(data: CandleData[], afStep: number, afMax: number): TimeValue[] {
  if (data.length < 2) return []
  const result: TimeValue[] = []
  let isLong = data[1].close > data[0].close
  let sar = isLong ? data[0].low : data[0].high
  let ep = isLong ? data[1].high : data[1].low
  let af = afStep
  result.push({ time: data[0].time, value: sar })
  for (let i = 1; i < data.length; i++) {
    sar = sar + af * (ep - sar)
    if (isLong) {
      sar = Math.min(sar, data[i - 1].low, i > 1 ? data[i - 2].low : data[i - 1].low)
      if (data[i].low < sar) { isLong = false; sar = ep; ep = data[i].low; af = afStep }
      else if (data[i].high > ep) { ep = data[i].high; af = Math.min(af + afStep, afMax) }
    } else {
      sar = Math.max(sar, data[i - 1].high, i > 1 ? data[i - 2].high : data[i - 1].high)
      if (data[i].high > sar) { isLong = true; sar = ep; ep = data[i].high; af = afStep }
      else if (data[i].low < ep) { ep = data[i].low; af = Math.min(af + afStep, afMax) }
    }
    result.push({ time: data[i].time, value: sar })
  }
  return result
}

// Bollinger Bands
export function calcBB(data: CandleData[], period: number, stdDev: number): { upper: TimeValue[]; middle: TimeValue[]; lower: TimeValue[] } {
  const upper: TimeValue[] = [], middle: TimeValue[] = [], lower: TimeValue[] = []
  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1)
    const sma = slice.reduce((s, d) => s + d.close, 0) / period
    const variance = slice.reduce((s, d) => s + Math.pow(d.close - sma, 2), 0) / period
    const std = Math.sqrt(variance)
    middle.push({ time: data[i].time, value: sma })
    upper.push({ time: data[i].time, value: sma + stdDev * std })
    lower.push({ time: data[i].time, value: sma - stdDev * std })
  }
  return { upper, middle, lower }
}

// Donchian Channels
export function calcDonchian(data: CandleData[], period: number): { upper: TimeValue[]; middle: TimeValue[]; lower: TimeValue[] } {
  const upper: TimeValue[] = [], middle: TimeValue[] = [], lower: TimeValue[] = []
  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1)
    const high = Math.max(...slice.map((d) => d.high))
    const low = Math.min(...slice.map((d) => d.low))
    upper.push({ time: data[i].time, value: high })
    lower.push({ time: data[i].time, value: low })
    middle.push({ time: data[i].time, value: (high + low) / 2 })
  }
  return { upper, middle, lower }
}

// ATR (internal)
function atrValues(data: CandleData[], period: number): number[] {
  const tr: number[] = [data[0].high - data[0].low]
  for (let i = 1; i < data.length; i++) {
    tr.push(Math.max(data[i].high - data[i].low, Math.abs(data[i].high - data[i - 1].close), Math.abs(data[i].low - data[i - 1].close)))
  }
  const result: number[] = []
  let atr = tr.slice(0, period).reduce((s, v) => s + v, 0) / period
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) { result.push(NaN); continue }
    if (i === period - 1) { result.push(atr); continue }
    atr = (atr * (period - 1) + tr[i]) / period
    result.push(atr)
  }
  return result
}

// Keltner Channels
export function calcKeltner(data: CandleData[], period: number, multiplier: number, atrPeriod: number): { upper: TimeValue[]; middle: TimeValue[]; lower: TimeValue[] } {
  const ema = calcEMA(data, period)
  const atr = atrValues(data, atrPeriod)
  const emaMap = new Map(ema.map((d) => [d.time, d.value]))
  const upper: TimeValue[] = [], middle: TimeValue[] = [], lower: TimeValue[] = []
  data.forEach((d, i) => {
    const e = emaMap.get(d.time)
    const a = atr[i]
    if (e !== undefined && !isNaN(a)) {
      middle.push({ time: d.time, value: e })
      upper.push({ time: d.time, value: e + multiplier * a })
      lower.push({ time: d.time, value: e - multiplier * a })
    }
  })
  return { upper, middle, lower }
}

// Envelope
export function calcEnvelope(data: CandleData[], period: number, percentage: number): { upper: TimeValue[]; middle: TimeValue[]; lower: TimeValue[] } {
  const sma = calcSMA(data, period)
  const factor = percentage / 100
  return {
    upper: sma.map((d) => ({ time: d.time, value: d.value * (1 + factor) })),
    middle: sma,
    lower: sma.map((d) => ({ time: d.time, value: d.value * (1 - factor) })),
  }
}

// Supertrend
export function calcSupertrend(data: CandleData[], period: number, multiplier: number): { values: TimeValue[]; isUp: boolean[] } {
  const atr = atrValues(data, period)
  const values: TimeValue[] = []
  const isUp: boolean[] = []
  let upperBand = 0, lowerBand = 0, supertrend = 0, prevClose = 0
  let prevUpper = 0, prevLower = 0, trending = true
  for (let i = 0; i < data.length; i++) {
    if (isNaN(atr[i])) continue
    const hl2 = (data[i].high + data[i].low) / 2
    const basicUpper = hl2 + multiplier * atr[i]
    const basicLower = hl2 - multiplier * atr[i]
    upperBand = (basicUpper < prevUpper || prevClose > prevUpper) ? basicUpper : prevUpper
    lowerBand = (basicLower > prevLower || prevClose < prevLower) ? basicLower : prevLower
    if (trending) {
      if (data[i].close < lowerBand) { trending = false; supertrend = upperBand }
      else { supertrend = lowerBand }
    } else {
      if (data[i].close > upperBand) { trending = true; supertrend = lowerBand }
      else { supertrend = upperBand }
    }
    values.push({ time: data[i].time, value: supertrend })
    isUp.push(trending)
    prevUpper = upperBand; prevLower = lowerBand; prevClose = data[i].close
  }
  return { values, isUp }
}

// Ichimoku
export function calcIchimoku(data: CandleData[], tenkan: number, kijun: number, senkou: number): {
  tenkanSen: TimeValue[]; kijunSen: TimeValue[]; senkouA: TimeValue[]; senkouB: TimeValue[]; chikou: TimeValue[]
} {
  const highLow = (arr: CandleData[]) => {
    const h = Math.max(...arr.map((d) => d.high))
    const l = Math.min(...arr.map((d) => d.low))
    return (h + l) / 2
  }
  const tenkanSen: TimeValue[] = [], kijunSen: TimeValue[] = [], senkouA: TimeValue[] = [], senkouB: TimeValue[] = [], chikou: TimeValue[] = []
  for (let i = 0; i < data.length; i++) {
    if (i >= tenkan - 1) tenkanSen.push({ time: data[i].time, value: highLow(data.slice(i - tenkan + 1, i + 1)) })
    if (i >= kijun - 1) kijunSen.push({ time: data[i].time, value: highLow(data.slice(i - kijun + 1, i + 1)) })
    if (i >= kijun - 1 && i >= tenkan - 1) {
      const t = highLow(data.slice(i - tenkan + 1, i + 1))
      const k = highLow(data.slice(i - kijun + 1, i + 1))
      senkouA.push({ time: data[Math.min(i + kijun, data.length - 1)].time, value: (t + k) / 2 })
    }
    if (i >= senkou - 1) senkouB.push({ time: data[Math.min(i + kijun, data.length - 1)].time, value: highLow(data.slice(i - senkou + 1, i + 1)) })
    if (i >= kijun) chikou.push({ time: data[i - kijun].time, value: data[i].close })
  }
  return { tenkanSen, kijunSen, senkouA, senkouB, chikou }
}

// RSI
export function calcRSI(data: CandleData[], period: number): TimeValue[] {
  const result: TimeValue[] = []
  let gains = 0, losses = 0
  for (let i = 1; i <= period; i++) {
    const change = data[i].close - data[i - 1].close
    if (change >= 0) gains += change; else losses -= change
  }
  let avgGain = gains / period, avgLoss = losses / period
  for (let i = period; i < data.length; i++) {
    const change = data[i].close - data[i - 1].close
    if (change >= 0) { avgGain = (avgGain * (period - 1) + change) / period; avgLoss = (avgLoss * (period - 1)) / period }
    else { avgGain = (avgGain * (period - 1)) / period; avgLoss = (avgLoss * (period - 1) - change) / period }
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss
    result.push({ time: data[i].time, value: 100 - 100 / (1 + rs) })
  }
  return result
}

// MACD
export function calcMACD(data: CandleData[], fastPeriod: number, slowPeriod: number, signalPeriod: number): {
  macd: TimeValue[]; signal: TimeValue[]; histogram: TimeValue[]
} {
  const closes = data.map((d) => d.close)
  const fastEMA = emaValues(closes, fastPeriod)
  const slowEMA = emaValues(closes, slowPeriod)
  const macdLine: number[] = fastEMA.map((f, i) => f - slowEMA[i])
  const signalLine = emaValues(macdLine.filter((v) => !isNaN(v)), signalPeriod)
  
  const macd: TimeValue[] = [], signal: TimeValue[] = [], histogram: TimeValue[] = []
  let signalIdx = 0
  let validCount = 0
  for (let i = 0; i < data.length; i++) {
    if (isNaN(macdLine[i])) continue
    macd.push({ time: data[i].time, value: macdLine[i] })
    if (validCount >= signalPeriod - 1 && signalIdx < signalLine.length && !isNaN(signalLine[signalIdx])) {
      signal.push({ time: data[i].time, value: signalLine[signalIdx] })
      histogram.push({ time: data[i].time, value: macdLine[i] - signalLine[signalIdx] })
      signalIdx++
    }
    validCount++
  }
  return { macd, signal, histogram }
}

// Stochastic
export function calcStochastic(data: CandleData[], kPeriod: number, kSmooth: number, dSmooth: number): { k: TimeValue[]; d: TimeValue[] } {
  const rawK: number[] = []
  for (let i = kPeriod - 1; i < data.length; i++) {
    const slice = data.slice(i - kPeriod + 1, i + 1)
    const high = Math.max(...slice.map((d) => d.high))
    const low = Math.min(...slice.map((d) => d.low))
    rawK.push(high === low ? 50 : ((data[i].close - low) / (high - low)) * 100)
  }
  // Smooth %K
  const smoothedK: number[] = []
  for (let i = kSmooth - 1; i < rawK.length; i++) {
    let sum = 0
    for (let j = 0; j < kSmooth; j++) sum += rawK[i - j]
    smoothedK.push(sum / kSmooth)
  }
  // %D = SMA of smoothed %K
  const dValues: number[] = []
  for (let i = dSmooth - 1; i < smoothedK.length; i++) {
    let sum = 0
    for (let j = 0; j < dSmooth; j++) sum += smoothedK[i - j]
    dValues.push(sum / dSmooth)
  }
  const startIdx = kPeriod - 1 + kSmooth - 1
  const k = smoothedK.map((v, i) => ({ time: data[startIdx + i].time, value: v }))
  const dStartIdx = startIdx + dSmooth - 1
  const d = dValues.map((v, i) => ({ time: data[dStartIdx + i].time, value: v }))
  return { k, d }
}

// Stochastic RSI
export function calcStochRSI(data: CandleData[], rsiPeriod: number, stochPeriod: number, kSmooth: number, dSmooth: number): { k: TimeValue[]; d: TimeValue[] } {
  const rsi = calcRSI(data, rsiPeriod)
  if (rsi.length < stochPeriod) return { k: [], d: [] }
  const rsiValues = rsi.map((d) => d.value)
  const rawK: { time: UTCTimestamp; value: number }[] = []
  for (let i = stochPeriod - 1; i < rsiValues.length; i++) {
    const slice = rsiValues.slice(i - stochPeriod + 1, i + 1)
    const max = Math.max(...slice), min = Math.min(...slice)
    rawK.push({ time: rsi[i].time, value: max === min ? 50 : ((rsiValues[i] - min) / (max - min)) * 100 })
  }
  // Simple smoothing for k and d
  const kArr: TimeValue[] = []
  for (let i = kSmooth - 1; i < rawK.length; i++) {
    let sum = 0
    for (let j = 0; j < kSmooth; j++) sum += rawK[i - j].value
    kArr.push({ time: rawK[i].time, value: sum / kSmooth })
  }
  const dArr: TimeValue[] = []
  for (let i = dSmooth - 1; i < kArr.length; i++) {
    let sum = 0
    for (let j = 0; j < dSmooth; j++) sum += kArr[i - j].value
    dArr.push({ time: kArr[i].time, value: sum / dSmooth })
  }
  return { k: kArr, d: dArr }
}

// CCI
export function calcCCI(data: CandleData[], period: number): TimeValue[] {
  const result: TimeValue[] = []
  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1)
    const tps = slice.map((d) => (d.high + d.low + d.close) / 3)
    const mean = tps.reduce((s, v) => s + v, 0) / period
    const meanDev = tps.reduce((s, v) => s + Math.abs(v - mean), 0) / period
    const tp = tps[tps.length - 1]
    result.push({ time: data[i].time, value: meanDev === 0 ? 0 : (tp - mean) / (0.015 * meanDev) })
  }
  return result
}

// Williams %R
export function calcWilliamsR(data: CandleData[], period: number): TimeValue[] {
  const result: TimeValue[] = []
  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1)
    const high = Math.max(...slice.map((d) => d.high))
    const low = Math.min(...slice.map((d) => d.low))
    result.push({ time: data[i].time, value: high === low ? -50 : ((high - data[i].close) / (high - low)) * -100 })
  }
  return result
}

// ADX
export function calcADX(data: CandleData[], period: number): { adx: TimeValue[]; plusDI: TimeValue[]; minusDI: TimeValue[] } {
  const plusDM: number[] = [], minusDM: number[] = [], tr: number[] = []
  for (let i = 1; i < data.length; i++) {
    const upMove = data[i].high - data[i - 1].high
    const downMove = data[i - 1].low - data[i].low
    plusDM.push(upMove > downMove && upMove > 0 ? upMove : 0)
    minusDM.push(downMove > upMove && downMove > 0 ? downMove : 0)
    tr.push(Math.max(data[i].high - data[i].low, Math.abs(data[i].high - data[i - 1].close), Math.abs(data[i].low - data[i - 1].close)))
  }
  // Smooth
  const smooth = (arr: number[], p: number) => {
    const res: number[] = []
    let s = arr.slice(0, p).reduce((a, b) => a + b, 0)
    res.push(s)
    for (let i = p; i < arr.length; i++) { s = s - s / p + arr[i]; res.push(s) }
    return res
  }
  const sTR = smooth(tr, period)
  const sPDM = smooth(plusDM, period)
  const sMDM = smooth(minusDM, period)
  const plusDI: TimeValue[] = [], minusDI: TimeValue[] = [], adx: TimeValue[] = []
  const dxValues: number[] = []
  for (let i = 0; i < sTR.length; i++) {
    const pdi = sTR[i] === 0 ? 0 : (sPDM[i] / sTR[i]) * 100
    const mdi = sTR[i] === 0 ? 0 : (sMDM[i] / sTR[i]) * 100
    const idx = period + i
    if (idx < data.length) {
      plusDI.push({ time: data[idx].time, value: pdi })
      minusDI.push({ time: data[idx].time, value: mdi })
      dxValues.push(pdi + mdi === 0 ? 0 : (Math.abs(pdi - mdi) / (pdi + mdi)) * 100)
    }
  }
  // ADX = smoothed DX
  if (dxValues.length >= period) {
    let adxVal = dxValues.slice(0, period).reduce((s, v) => s + v, 0) / period
    adx.push({ time: plusDI[period - 1]?.time, value: adxVal })
    for (let i = period; i < dxValues.length; i++) {
      adxVal = (adxVal * (period - 1) + dxValues[i]) / period
      if (plusDI[i]) adx.push({ time: plusDI[i].time, value: adxVal })
    }
  }
  return { adx, plusDI, minusDI }
}

// ATR
export function calcATR(data: CandleData[], period: number): TimeValue[] {
  const atr = atrValues(data, period)
  return data.map((d, i) => ({ time: d.time, value: atr[i] })).filter((d) => !isNaN(d.value))
}

// MFI
export function calcMFI(data: CandleData[], period: number): TimeValue[] {
  const result: TimeValue[] = []
  const tp = data.map((d) => (d.high + d.low + d.close) / 3)
  for (let i = period; i < data.length; i++) {
    let posFlow = 0, negFlow = 0
    for (let j = i - period + 1; j <= i; j++) {
      const mf = tp[j] * (data[j].volume || 1)
      if (tp[j] > tp[j - 1]) posFlow += mf; else negFlow += mf
    }
    const mfr = negFlow === 0 ? 100 : posFlow / negFlow
    result.push({ time: data[i].time, value: 100 - 100 / (1 + mfr) })
  }
  return result
}

// OBV
export function calcOBV(data: CandleData[]): TimeValue[] {
  const result: TimeValue[] = [{ time: data[0].time, value: 0 }]
  let obv = 0
  for (let i = 1; i < data.length; i++) {
    if (data[i].close > data[i - 1].close) obv += (data[i].volume || 1)
    else if (data[i].close < data[i - 1].close) obv -= (data[i].volume || 1)
    result.push({ time: data[i].time, value: obv })
  }
  return result
}

// CMF
export function calcCMF(data: CandleData[], period: number): TimeValue[] {
  const result: TimeValue[] = []
  for (let i = period - 1; i < data.length; i++) {
    let mfv = 0, vol = 0
    for (let j = i - period + 1; j <= i; j++) {
      const range = data[j].high - data[j].low
      const clv = range === 0 ? 0 : ((data[j].close - data[j].low) - (data[j].high - data[j].close)) / range
      mfv += clv * (data[j].volume || 1)
      vol += (data[j].volume || 1)
    }
    result.push({ time: data[i].time, value: vol === 0 ? 0 : mfv / vol })
  }
  return result
}

// ROC
export function calcROC(data: CandleData[], period: number): TimeValue[] {
  const result: TimeValue[] = []
  for (let i = period; i < data.length; i++) {
    result.push({ time: data[i].time, value: data[i - period].close === 0 ? 0 : ((data[i].close - data[i - period].close) / data[i - period].close) * 100 })
  }
  return result
}

// Momentum
export function calcMomentum(data: CandleData[], period: number): TimeValue[] {
  const result: TimeValue[] = []
  for (let i = period; i < data.length; i++) {
    result.push({ time: data[i].time, value: data[i].close - data[i - period].close })
  }
  return result
}

// TRIX
export function calcTRIX(data: CandleData[], period: number): TimeValue[] {
  const ema1 = calcEMA(data, period)
  if (ema1.length < period) return []
  const fakeCandles = (arr: TimeValue[]) => arr.map((d) => ({ ...d, open: d.value, high: d.value, low: d.value, close: d.value }) as unknown as CandleData)
  const ema2 = calcEMA(fakeCandles(ema1), period)
  const ema3 = calcEMA(fakeCandles(ema2), period)
  const result: TimeValue[] = []
  for (let i = 1; i < ema3.length; i++) {
    result.push({ time: ema3[i].time, value: ema3[i - 1].value === 0 ? 0 : ((ema3[i].value - ema3[i - 1].value) / ema3[i - 1].value) * 100 })
  }
  return result
}

// Awesome Oscillator
export function calcAwesome(data: CandleData[], fastPeriod: number, slowPeriod: number): TimeValue[] {
  const result: TimeValue[] = []
  for (let i = slowPeriod - 1; i < data.length; i++) {
    const fastSlice = data.slice(i - fastPeriod + 1, i + 1)
    const slowSlice = data.slice(i - slowPeriod + 1, i + 1)
    const fastMA = fastSlice.reduce((s, d) => s + (d.high + d.low) / 2, 0) / fastPeriod
    const slowMA = slowSlice.reduce((s, d) => s + (d.high + d.low) / 2, 0) / slowPeriod
    result.push({ time: data[i].time, value: fastMA - slowMA })
  }
  return result
}

// Chaikin Oscillator
export function calcChaikin(data: CandleData[], fastPeriod: number, slowPeriod: number): TimeValue[] {
  // AD Line
  const adl: number[] = []
  let adlVal = 0
  for (const d of data) {
    const range = d.high - d.low
    const clv = range === 0 ? 0 : ((d.close - d.low) - (d.high - d.close)) / range
    adlVal += clv * (d.volume || 1)
    adl.push(adlVal)
  }
  const fastEMA = emaValues(adl, fastPeriod)
  const slowEMA = emaValues(adl, slowPeriod)
  return data.map((d, i) => ({ time: d.time, value: fastEMA[i] - slowEMA[i] })).filter((d) => !isNaN(d.value))
}

// DMI (same as ADX but we only return +DI and -DI)
export function calcDMI(data: CandleData[], period: number): { plusDI: TimeValue[]; minusDI: TimeValue[] } {
  const { plusDI, minusDI } = calcADX(data, period)
  return { plusDI, minusDI }
}

// ─── Master Calculation Dispatcher ───────────────────────────────
export function calculateIndicator(type: string, data: CandleData[], params: Record<string, number | string>): Record<string, TimeValue[]> {
  const p = (key: string, def: number) => typeof params[key] === "number" ? params[key] as number : def
  
  switch (type) {
    case "SMA": return { main: calcSMA(data, p("period", 20), params.source as string) }
    case "EMA": return { main: calcEMA(data, p("period", 20), params.source as string) }
    case "WMA": return { main: calcWMA(data, p("period", 20)) }
    case "DEMA": return { main: calcDEMA(data, p("period", 20)) }
    case "TEMA": return { main: calcTEMA(data, p("period", 20)) }
    case "KAMA": return { main: calcKAMA(data, p("period", 10), p("fastPeriod", 2), p("slowPeriod", 30)) }
    case "VWAP": return { main: calcVWAP(data) }
    case "PSAR": return { main: calcPSAR(data, p("afStep", 0.02), p("afMax", 0.2)) }
    case "BB": { const r = calcBB(data, p("period", 20), p("stdDev", 2)); return { upper: r.upper, middle: r.middle, lower: r.lower } }
    case "DONCHIAN": { const r = calcDonchian(data, p("period", 20)); return { upper: r.upper, middle: r.middle, lower: r.lower } }
    case "KELTNER": { const r = calcKeltner(data, p("period", 20), p("multiplier", 1.5), p("atrPeriod", 10)); return { upper: r.upper, middle: r.middle, lower: r.lower } }
    case "ENVELOPE": { const r = calcEnvelope(data, p("period", 20), p("percentage", 2.5)); return { upper: r.upper, middle: r.middle, lower: r.lower } }
    case "SUPERTREND": { const r = calcSupertrend(data, p("period", 10), p("multiplier", 3)); return { main: r.values } }
    case "ICHIMOKU": { const r = calcIchimoku(data, p("tenkan", 9), p("kijun", 26), p("senkou", 52)); return { tenkan: r.tenkanSen, kijun: r.kijunSen, senkouA: r.senkouA, senkouB: r.senkouB, chikou: r.chikou } }
    case "RSI": return { main: calcRSI(data, p("period", 14)) }
    case "MACD": { const r = calcMACD(data, p("fastPeriod", 12), p("slowPeriod", 26), p("signalPeriod", 9)); return { main: r.macd, signal: r.signal, histogram: r.histogram } }
    case "STOCH": { const r = calcStochastic(data, p("kPeriod", 14), p("kSmooth", 1), p("dSmooth", 3)); return { main: r.k, d: r.d } }
    case "STOCHRSI": { const r = calcStochRSI(data, p("rsiPeriod", 14), p("stochPeriod", 14), p("kSmooth", 3), p("dSmooth", 3)); return { main: r.k, d: r.d } }
    case "CCI": return { main: calcCCI(data, p("period", 20)) }
    case "WILLIAMSR": return { main: calcWilliamsR(data, p("period", 14)) }
    case "ADX": { const r = calcADX(data, p("period", 14)); return { main: r.adx, plusDI: r.plusDI, minusDI: r.minusDI } }
    case "ATR": return { main: calcATR(data, p("period", 14)) }
    case "VOL": return { histogram: data.map(d => ({ time: d.time, value: d.volume || 0 })) }
    case "MFI": return { main: calcMFI(data, p("period", 14)) }
    case "OBV": return { main: calcOBV(data) }
    case "CMF": return { main: calcCMF(data, p("period", 20)) }
    case "ROC": return { main: calcROC(data, p("period", 12)) }
    case "MOMENTUM": return { main: calcMomentum(data, p("period", 10)) }
    case "TRIX": return { main: calcTRIX(data, p("period", 18)) }
    case "AWESOME": return { main: calcAwesome(data, p("fastPeriod", 5), p("slowPeriod", 34)) }
    case "CHAIKIN": return { main: calcChaikin(data, p("fastPeriod", 3), p("slowPeriod", 10)) }
    case "DMI": { const r = calcDMI(data, p("period", 14)); return { plusDI: r.plusDI, minusDI: r.minusDI } }
    default: return {}
  }
}
