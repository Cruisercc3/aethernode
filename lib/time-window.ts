// Plain-language descriptions of the time a data set actually covers.
// The analytics cards and the AI route both use these, so the label the
// model reads always comes from the timestamps in the data it was sent.

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

/** "29 Oct 14:05 UTC" */
export function formatUtc(ms: number): string {
  const d = new Date(ms)
  const hh = String(d.getUTCHours()).padStart(2, "0")
  const mm = String(d.getUTCMinutes()).padStart(2, "0")
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${hh}:${mm} UTC`
}

/** "45 minutes", "12 hours", "3.5 days" */
export function formatDuration(ms: number): string {
  if (ms < 2 * HOUR) {
    const m = Math.max(1, Math.round(ms / MINUTE))
    return `${m} minute${m === 1 ? "" : "s"}`
  }
  if (ms < 3 * DAY) {
    const h = Math.round((ms / HOUR) * 10) / 10
    return `${h} hours`
  }
  const d = Math.round((ms / DAY) * 10) / 10
  return `${d} days`
}

/** "15-minute", "1-hour", "8-hour", "1-day" */
export function formatStep(ms: number): string {
  if (ms < HOUR) return `${Math.round(ms / MINUTE)}-minute`
  if (ms < DAY) return `${Math.round(ms / HOUR)}-hour`
  return `${Math.round(ms / DAY)}-day`
}

/**
 * Describe a series of point-in-time readings, e.g.
 * "36 readings at 1-hour steps, 28 Oct 06:00 UTC to 29 Oct 17:00 UTC (35 hours)".
 */
export function describeReadings(timestamps: number[], noun = "readings"): string {
  const ts = timestamps.filter((t) => Number.isFinite(t)).sort((a, b) => a - b)
  if (ts.length === 0) return `no ${noun}`
  if (ts.length === 1) return `1 reading at ${formatUtc(ts[0])}`
  const first = ts[0]
  const last = ts[ts.length - 1]
  const step = (last - first) / (ts.length - 1)
  return `${ts.length} ${noun} at ${formatStep(step)} steps, ${formatUtc(first)} to ${formatUtc(last)} (${formatDuration(last - first)})`
}

/**
 * Describe a run of candles by their open times. The last candle is usually
 * still open, so the window ends at whichever comes first: its close or `now`.
 */
export function describeCandles(openTimes: number[], now = Date.now()): string {
  const ts = openTimes.filter((t) => Number.isFinite(t)).sort((a, b) => a - b)
  if (ts.length === 0) return "no candles"
  const step = ts.length > 1 ? (ts[ts.length - 1] - ts[0]) / (ts.length - 1) : 0
  const start = ts[0]
  const end = step > 0 ? Math.min(now, ts[ts.length - 1] + step) : now
  const size = step > 0 ? `${formatStep(step)} ` : ""
  return `${ts.length} ${size}candles, ${formatUtc(start)} to ${formatUtc(end)} (${formatDuration(end - start)})`
}

/** Describe a window between two instants. */
export function describeSpan(startMs: number, endMs: number): string {
  return `${formatUtc(startMs)} to ${formatUtc(endMs)} (${formatDuration(endMs - startMs)})`
}
