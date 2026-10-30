// AI Insight for the analytics cards. Plain fetch to Groq's OpenAI-compatible
// API, no SDK. Every data block in the prompt carries the time window it
// really covers, worked out from the timestamps the card sent.

import { describeCandles } from "@/lib/time-window"

const MODEL = "openai/gpt-oss-120b"

// gpt-oss is a reasoning model and its hidden reasoning counts against this
// budget, so it needs far more room than the 2-3 sentences it writes.
const MAX_COMPLETION_TOKENS = 1500

const MAX_POINTS = 60
const MAX_DATA_CHARS = 20_000

const TOOL_CONTEXT: Record<string, string> = {
  "liquidation-map":
    "These are real forced liquidations from OKX's perpetual swap for this coin, grouped into price buckets with their USD value. Focus on: where liquidations clustered relative to the current price, which side (longs or shorts) was liquidated more, and what that says about the recent move.",
  "open-interest":
    "This is open interest in units of the base coin. Focus on: whether OI rose or fell over its window, what that implies about positions opening or closing, any divergence with price, and the percentage change.",
  "long-short":
    "This is Bybit's account long/short ratio: the share of accounts holding net long versus net short positions. Focus on: which way the market is skewed, whether positioning looks crowded, and any contrarian signal.",
  "funding-rate":
    "This is the perpetual funding rate at each settlement, in percent. Focus on: whether funding is positive or negative and what that means, any spikes or sustained extremes, and what the trend says about sentiment.",
  "taker-volume":
    "This is rolling 24-hour USD turnover for the top USDT perpetuals on Bybit. Focus on: which pairs dominate volume, what the distribution says about market interest, and any notable rotation.",
  "market-heatmap":
    "These are the top USDT perpetuals by 24-hour volume with each one's price change over the stated window. Focus on: which coins and themes are outperforming or underperforming, how broad the move is, and where money seems to be going.",
}

type Kline = { open: number; high: number; low: number; close: number; timestamp?: number }

function fmtPrice(n: number): string {
  if (!Number.isFinite(n)) return "n/a"
  return n.toLocaleString("en-US", { maximumFractionDigits: n >= 1 ? 2 : 8 })
}

function buildPriceBlock(priceContext: unknown): string {
  if (!priceContext || typeof priceContext !== "object") return ""
  const { currentPrice, klines } = priceContext as { currentPrice?: number; klines?: Kline[] }
  let block = ""
  if (typeof currentPrice === "number" && currentPrice > 0) {
    block += `\nCurrent price: $${fmtPrice(currentPrice)}`
  }
  if (Array.isArray(klines) && klines.length > 0) {
    const rows = klines.filter(
      (k) => k && Number.isFinite(k.open) && Number.isFinite(k.close) && Number.isFinite(k.high) && Number.isFinite(k.low),
    )
    if (rows.length > 0) {
      const first = rows[0]
      const last = rows[rows.length - 1]
      const high = Math.max(...rows.map((k) => k.high))
      const low = Math.min(...rows.map((k) => k.low))
      const change = ((last.close - first.open) / first.open) * 100
      const times = rows.map((k) => Number(k.timestamp)).filter((t) => Number.isFinite(t))
      const window = times.length === rows.length ? describeCandles(times) : `${rows.length} candles`
      block += `\nPrice over ${window}: open $${fmtPrice(first.open)}, latest $${fmtPrice(last.close)} (${change >= 0 ? "+" : ""}${change.toFixed(2)}%), high $${fmtPrice(high)}, low $${fmtPrice(low)}`
    }
  }
  return block
}

function trimData(data: unknown): { data: unknown; note: string } {
  if (!Array.isArray(data) || data.length <= MAX_POINTS) return { data, note: "" }
  const half = MAX_POINTS / 2
  return {
    data: [...data.slice(0, half), ...data.slice(-half)],
    note: ` (showing the first ${half} and last ${half} of ${data.length} points)`,
  }
}

// For the status page: says whether a key is set, without calling Groq
export async function GET() {
  return Response.json(
    { configured: Boolean(process.env.GROQ_API_KEY), model: MODEL },
    { headers: { "Cache-Control": "no-store" } },
  )
}

export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return Response.json({ analysis: "Request body must be JSON." }, { status: 400 })
  }

  const { tool, data, symbol, window, priceContext } = body as {
    tool?: string
    data?: unknown
    symbol?: string
    window?: string
    priceContext?: unknown
  }

  if (!tool || !data) {
    return Response.json({ analysis: "Missing required parameters." }, { status: 400 })
  }
  const toolContext = TOOL_CONTEXT[tool]
  if (!toolContext) {
    return Response.json({ analysis: "Unknown analysis tool." }, { status: 400 })
  }

  const trimmed = trimData(data)
  const dataJson = JSON.stringify(trimmed.data)
  if (dataJson.length > MAX_DATA_CHARS) {
    return Response.json({ analysis: "Too much data for one analysis." }, { status: 413 })
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return Response.json({
      analysis:
        "AI analysis needs a Groq API key. Set GROQ_API_KEY in the environment to turn it on.",
    })
  }

  const windowLabel = typeof window === "string" && window.trim() ? window.trim().slice(0, 300) : "not stated"
  const symbolLabel = typeof symbol === "string" && symbol.trim() ? symbol.trim().slice(0, 30) : "BTCUSDT"
  const priceBlock = buildPriceBlock(priceContext)

  const userPrompt =
    `Symbol: ${symbolLabel}${priceBlock}\n\n` +
    `${toolContext}\n\n` +
    `Metric data window: ${windowLabel}${trimmed.note}\n` +
    `Metric data:\n${dataJson}\n\n` +
    `Write 2-3 sentences. Quote real numbers from the data. Each block covers only the window stated for it. Only compare the metric with price where the two windows match, and if they don't, give each change with its own window.`

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are a crypto futures analyst. You get one metric from a live chart plus price context, and each block states the time window it covers. Give a concise 2-3 sentence read. Reference the actual prices, percentage changes and numbers from the data, and tie the metric to the price action over matching windows. Be direct and specific. No disclaimers and no financial advice warnings.",
          },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.5,
        reasoning_effort: "low",
        max_completion_tokens: MAX_COMPLETION_TOKENS,
      }),
      signal: AbortSignal.timeout(25_000),
    })

    if (!response.ok) {
      const errBody = await response.text()
      console.error("Groq API error:", response.status, errBody.slice(0, 500))
      return Response.json(
        { analysis: "Analysis temporarily unavailable. Please try again shortly." },
        { status: 502 },
      )
    }

    const result = await response.json()
    const content: unknown = result.choices?.[0]?.message?.content
    const analysis = typeof content === "string" ? content.trim() : ""
    if (!analysis) {
      console.error("Groq returned no text. finish_reason:", result.choices?.[0]?.finish_reason)
      return Response.json(
        { analysis: "The model returned no text this time. Please try again." },
        { status: 502 },
      )
    }

    return Response.json({ analysis })
  } catch (error) {
    console.error("AI analysis error:", error)
    return Response.json(
      { analysis: "Analysis temporarily unavailable. Please try again shortly." },
      { status: 500 },
    )
  }
}
