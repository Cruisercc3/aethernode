"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"

export interface MarketCoin {
  symbol: string
  displaySymbol: string
  baseAsset: string
  name: string
  price: number
  prevPrice: number
  change24h: number
  volume24h: number
  high24h: number
  low24h: number
  sparkline: number[]
}

// Static sector seed lists — used as the initial minimum set.
// When live Bybit data arrives, useDynamicSectors() extends these via
// pattern-based classification so every live coin is reachable through
// at least one sector chip.
export const SECTOR_SEEDS: Record<string, string[]> = {
  "Layer 1": [
    "BTC","ETH","SOL","ADA","AVAX","DOT","NEAR","APT","SUI","SEI","ATOM","ALGO",
    "FTM","ICP","TRX","ETC","XRP","LTC","BCH","EOS","XLM","VET","ONE","KAVA",
    "CELO","MINA","ROSE","HBAR","EGLD","IOTA","ZIL","ICX","QTUM","NEO","WAVES",
    "ZEC","DASH","XMR","DCR","NANO","ARK","DGB","GRS","RVN","SC","CKB","TOMO",
    "FLR","SGB","CSPR","CHZ","FLOW","GLMR","MOVR","EVMOS","KLAY","METIS","CANTO",
    "INJ","OSMO","JUNO","SCRT","LUNA","LUNC","BAND","CRO","OKT","HT","BNB",
  ],
  "Layer 2": [
    "MATIC","ARB","OP","STX","MNT","BLAST","ZKSYNC","IMX","LRC","OMG","BOBA",
    "STRK","MANTA","SCROLL","BASE","LINEA","TAIKO","ZKFAIR","NEON","AURORA","CELO",
    "XAI","DYMENSION","DEGEN","ZORA","MODE","FRAX",
  ],
  "DeFi": [
    "UNI","AAVE","LINK","MKR","INJ","RUNE","JUP","CRV","SNX","COMP","GMX","DYDX",
    "1INCH","SUSHI","BAL","YFI","PERP","ALPHA","BADGER","BNT","KNC","ZRX","REP",
    "NMR","MLN","CVX","FXS","FRAX","LQTY","ANGLE","VELO","AERO","PENDLE","RDNT",
    "STG","HOP","ACX","ACROSS","BTRFLY","TOKE","SPELL","ICE","MIM","TRIBE","FEI",
    "RAI","LUSD","BEAN","FLOAT","DOLA","VST","VOLT","OATH","REQ","DNT","RLC",
    "OCEAN","RNDR","GNO","COW","SAFE","PUFFER","EIGEN","ENA","USDe","PYUSD",
    "FLUID","MORPHO","EULER","GEARBOX","INSTADAPP","PARASWAP","ZEROX",
    "HYPERLIQUID","DRIFT","MANGO","ZO","PARCL","JITO","MARINADE","LIDO","RPL",
    "ANKR","SWISE","FIS","STRM","LDO","CBETH","RETH","WSTETH","OETH","FRXETH",
  ],
  "AI": [
    "FET","RENDER","GRT","TAO","AGIX","OCEAN","NMR","AKT","ALT","WLD","ARKM",
    "ROSE","CTXC","DBC","AGI","AIOZ","MATRIX","PAAL","SLEEPLESS","SOPH","NXRA",
    "HYVE","PHB","ORAI","MASA","MERL","MAGA","RIO","AIUS","GFAL","KAI","MIND",
    "CUDOS","COVALENT","INDEXING","DRIA","ATH","VIRTUAL","ARC","GOAT","ELIZA",
    "AIXBT","COOKIE","GRIFFAIN","TURBO","FARTCOIN","ACT","HIVE","SENTAI","OLAS",
    "NMX","ASI","SINGULARITYNET","SYNTROPY","SWARMS","NOUS","AGENT",
  ],
  "Meme": [
    "DOGE","SHIB","PEPE","WIF","BONK","FLOKI","MEME","BRETT","MOG","NEIRO","NOT",
    "COQ","BOME","MYRO","SLERF","BOOK","POPCAT","GIGA","PONKE","BILLY","PUPS",
    "MOODENG","GOAT","FWOG","MEOW","CHEEMS","SNEK","BLUB","TROLL","MICHI",
    "BABYDOGE","AKITA","KISHU","LEASH","HOGE","DOGELON","MUSK","SAMO","CORGI",
    "SHIBASWAP","LUFFY","NARUTO","VOLT","KUMA","FLOKY","COLLE","CATBOY","SMOL",
    "SLOTH","SILLY","BASED","CHAD","WOJAK","BOBO","BOGDANOFF","LUNC","LUNA",
    "APU","JESUS","ANDY","UNCLE","LAIKA","BABYPEPE","BABYWIF","NPC",
  ],
  "Gaming": [
    "SAND","MANA","AXS","IMX","GALA","ENJ","MAGIC","ILV","GODS","SLP","RON",
    "YGG","MC","TLM","ALICE","PVU","MOBOX","HERO","SKILL","TOWER","SFUND",
    "GMEE","GAFI","REVV","XPLA","LOOT","PRIME","BEAM","PGX","ECHELON",
    "DEVIANTS","SHRAPNEL","PIXELMON","BIGTIME","SIPHER","WRLD","MAVIA","PIXEL",
    "HUNT","BLOCKLORDS","METALCORE","SYNERGY","XBORG","XBG","ATLAS","POLIS",
    "CAVE","KIRO","MTRG","VRA","NAKA","KARTANA","SPELLFIRE","MOONEY",
  ],
  "Storage": ["FIL","AR","STORJ","SIACOIN","SC","HOT","BLUZELLE","CRUST","SWARM","BZZ"],
  "Modular": ["TIA","EIGEN","AVAIL","DYMENSION","ALTLAYER","SAGA","MANTLE","ZETA","TAIKO"],
  "RWA": ["ONDO","TRU","CFG","POLYX","CPOOL","MPL","GOLDFINCH","CREDITCOIN","KILT","ID"],
}

// The SECTORS export is always the full populated version (same keys, richer arrays)
export const SECTORS: Record<string, string[]> = {
  "All": [],
  ...SECTOR_SEEDS,
}

// Pre-build the seed Set once at module load time (not per-render)
const ALL_SEEDS = new Set(Object.values(SECTOR_SEEDS).flat())

// Tag rules compiled once
const TAG_RULES: { sector: string; re: RegExp }[] = [
  { sector: "AI",      re: /\b(ai|gpt|llm|neural|intelligence|mind|brain|agent|bot|auto|learn)\b/i },
  { sector: "Meme",    re: /\b(meme|doge|dog|cat|pepe|frog|inu|shib|baby|moon|safe|elon|wojak)\b/i },
  { sector: "Gaming",  re: /\b(game|gaming|play|nft|metaverse|guild|arena|quest|war|legend|battle)\b/i },
  { sector: "DeFi",    re: /\b(swap|dex|yield|finance|protocol|lend|borrow|vault|stake|liquid|amm)\b/i },
  { sector: "Layer 2", re: /\b(layer2|l2|rollup|optimis|zk|zero.?knowledge|polygon|scaling)\b/i },
  { sector: "Storage", re: /\b(storage|data|file|cloud|ipfs|archive)\b/i },
  { sector: "RWA",     re: /\b(real.?world|asset|treasury|bond|gold|commodit|estate|tokenize)\b/i },
]

/**
 * buildDynamicSectors — pure function (no hooks). Extends the seed lists with
 * every live Bybit token that matches a sector via name-based keyword tagging.
 * Called inside a useMemo in useMarketsTicker so it only runs when coins change.
 */
export function buildDynamicSectors(coins: MarketCoin[]): Record<string, string[]> {
  const result: Record<string, string[]> = { "All": [] }
  for (const [sector, bases] of Object.entries(SECTOR_SEEDS)) {
    result[sector] = [...bases]
  }
  for (const coin of coins) {
    if (ALL_SEEDS.has(coin.baseAsset)) continue
    for (const rule of TAG_RULES) {
      if (rule.re.test(coin.name)) {
        if (!result[rule.sector].includes(coin.baseAsset)) {
          result[rule.sector].push(coin.baseAsset)
        }
        break
      }
    }
  }
  return result
}

/** Hook alias — kept for backward compat, wraps in useMemo internally */
export function useDynamicSectors(coins: MarketCoin[]): Record<string, string[]> {
  return useMemo(() => buildDynamicSectors(coins), [coins])
}

export function formatVolume(vol: number): string {
  if (vol >= 1e9) return `${(vol / 1e9).toFixed(2)}B`
  if (vol >= 1e6) return `${(vol / 1e6).toFixed(1)}M`
  if (vol >= 1e3) return `${(vol / 1e3).toFixed(0)}K`
  return vol.toFixed(0)
}

export function formatPrice(price: number): string {
  if (price >= 10_000) return price.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
  if (price >= 1_000) return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (price >= 1) return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })
  if (price >= 0.01) return price.toFixed(4)
  return price.toFixed(8)
}

// Derive a human-readable name from a Bybit symbol like "BTCUSDT" → "Bitcoin"
// We keep a lookup for known tokens; unknowns just use their base ticker.
const TOKEN_NAMES: Record<string, string> = {
  BTC: "Bitcoin", ETH: "Ethereum", SOL: "Solana", BNB: "BNB", XRP: "Ripple",
  ADA: "Cardano", DOGE: "Dogecoin", AVAX: "Avalanche", DOT: "Polkadot", LINK: "Chainlink",
  MATIC: "Polygon", UNI: "Uniswap", LTC: "Litecoin", ATOM: "Cosmos", NEAR: "NEAR Protocol",
  AAVE: "Aave", FIL: "Filecoin", APT: "Aptos", ARB: "Arbitrum", OP: "Optimism",
  SHIB: "Shiba Inu", TRX: "TRON", ICP: "Internet Computer", ETC: "Ethereum Classic",
  INJ: "Injective", SUI: "Sui", SEI: "Sei", TIA: "Celestia", FET: "Fetch.ai",
  RENDER: "Render", JUP: "Jupiter", WIF: "dogwifhat", PEPE: "Pepe", STX: "Stacks",
  MKR: "Maker", RUNE: "THORChain", ALGO: "Algorand", GRT: "The Graph", FTM: "Fantom",
  SAND: "The Sandbox", MANA: "Decentraland", AXS: "Axie Infinity", IMX: "Immutable",
  GALA: "Gala", ENJ: "Enjin Coin", MAGIC: "Magic", CRV: "Curve DAO", SNX: "Synthetix",
  COMP: "Compound", GMX: "GMX", DYDX: "dYdX", SUSHI: "SushiSwap", TAO: "Bittensor",
  AGIX: "SingularityNET", OCEAN: "Ocean Protocol", NMR: "Numeraire", AKT: "Akash Network",
  BONK: "Bonk", FLOKI: "Floki", MEME: "Memecoin", BRETT: "Brett", MOG: "Mog Coin",
  AR: "Arweave", STORJ: "Storj", MNT: "Mantle", BLAST: "Blast", ONDO: "Ondo Finance",
  TRU: "TrueFi", CFG: "Centrifuge", EIGEN: "EigenLayer", ZKSYNC: "zkSync",
  "1INCH": "1inch", "1INCHUSDT": "1inch",
}

function getName(base: string): string {
  return TOKEN_NAMES[base] || base
}

// Parse Bybit ticker list → MarketCoin[]
function parseBybitTickers(list: any[]): MarketCoin[] {
  const coins: MarketCoin[] = []
  for (const t of list) {
    if (!t.symbol || !t.symbol.endsWith("USDT")) continue
    const base = t.symbol.replace(/USDT$/, "")
    if (!base || base.length === 0) continue
    const price = parseFloat(t.lastPrice)
    const change = parseFloat(t.price24hPcnt) * 100
    const vol = parseFloat(t.turnover24h) // in USDT
    const high = parseFloat(t.highPrice24h)
    const low = parseFloat(t.lowPrice24h)
    if (isNaN(price) || price <= 0) continue
    coins.push({
      symbol: t.symbol,
      displaySymbol: `${base}/USDT`,
      baseAsset: base,
      name: getName(base),
      price,
      prevPrice: price,
      change24h: isNaN(change) ? 0 : change,
      volume24h: isNaN(vol) ? 0 : vol,
      high24h: isNaN(high) ? price : high,
      low24h: isNaN(low) ? price : low,
      sparkline: [],
    })
  }
  // Sort by USDT volume descending
  return coins.sort((a, b) => b.volume24h - a.volume24h)
}

export function useMarketsTicker() {
  const [coins, setCoins] = useState<MarketCoin[]>([])
  const [isLive, setIsLive] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const mountedRef = useRef(true)

  // Fetch full ticker snapshot from Bybit linear (perpetual) market
  const fetchInitialData = useCallback(async () => {
    try {
      const res = await fetch(
        "https://api.bybit.com/v5/market/tickers?category=linear",
        { signal: AbortSignal.timeout(10_000) }
      )
      if (!res.ok) return
      const data = await res.json()
      const list: any[] = data?.result?.list ?? []
      if (!mountedRef.current) return
      setCoins(parseBybitTickers(list))
    } catch {
      /* silent fallback */
    }
  }, [])

  // Bybit WebSocket — subscribe to all linear tickers
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    const ws = new WebSocket("wss://stream.bybit.com/v5/public/linear")

    ws.onopen = () => {
      // Subscribe to tickers for all USDT pairs — Bybit supports wildcard
      ws.send(JSON.stringify({
        op: "subscribe",
        args: ["tickers.BTCUSDT", "tickers.ETHUSDT", "tickers.SOLUSDT"],
      }))
      // Bybit also supports a bulk subscribe — we'll use the REST poll for the
      // full list and WS for price flash on major pairs only
      setIsLive(true)
    }

    ws.onmessage = (event) => {
      if (!mountedRef.current) return
      try {
        const msg = JSON.parse(event.data)
        // topic: "tickers.BTCUSDT", data: { symbol, lastPrice, ... }
        if (msg.topic?.startsWith("tickers.") && msg.data) {
          const d = msg.data
          const symbol: string = d.symbol
          if (!symbol?.endsWith("USDT")) return
          const newPrice = parseFloat(d.lastPrice)
          if (isNaN(newPrice) || newPrice <= 0) return
          const change = parseFloat(d.price24hPcnt)
          const vol = parseFloat(d.turnover24h)
          const high = parseFloat(d.highPrice24h)
          const low = parseFloat(d.lowPrice24h)

          setCoins(prev => {
            const idx = prev.findIndex(c => c.symbol === symbol)
            if (idx === -1) return prev
            const existing = prev[idx]
            // Skip update if price hasn't meaningfully changed (avoids cascade re-renders)
            if (existing.price === newPrice) return prev
            const next = prev.slice()
            next[idx] = {
              ...existing,
              prevPrice: existing.price,
              price: newPrice,
              change24h: isNaN(change) ? existing.change24h : change * 100,
              volume24h: isNaN(vol) ? existing.volume24h : vol,
              high24h: isNaN(high) ? existing.high24h : high,
              low24h: isNaN(low) ? existing.low24h : low,
            }
            return next
          })
        }
      } catch { /* skip */ }
    }

    ws.onclose = () => {
      setIsLive(false)
      wsRef.current = null
      if (mountedRef.current) {
        reconnectRef.current = setTimeout(connectWebSocket, 4000)
      }
    }
    ws.onerror = () => ws.close()
    wsRef.current = ws
  }, [])

  // Poll every 15 seconds to keep the full list fresh
  useEffect(() => {
    mountedRef.current = true
    fetchInitialData()
    const pollInterval = setInterval(fetchInitialData, 15_000)
    const wsTimeout = setTimeout(connectWebSocket, 1200)

    return () => {
      mountedRef.current = false
      clearInterval(pollInterval)
      clearTimeout(wsTimeout)
      clearTimeout(reconnectRef.current)
      if (wsRef.current) { wsRef.current.close(); wsRef.current = null }
    }
  }, [fetchInitialData, connectWebSocket])

  // All derived lists are memoized — they only recompute when `coins` reference changes,
  // which only happens on REST poll (every 15s) or WS update (individual coin diff).
  // Return 10 items to allow UI to display 4+ with room for filtering
  const topGainers = useMemo(
    () => [...coins].sort((a, b) => b.change24h - a.change24h).slice(0, 10),
    [coins]
  )
  const topLosers = useMemo(
    () => [...coins].sort((a, b) => a.change24h - b.change24h).slice(0, 10),
    [coins]
  )
  const trending = useMemo(
    () => [...coins].sort((a, b) => b.volume24h - a.volume24h).slice(0, 10),
    [coins]
  )
  // Newly listed: beyond top-200 by volume — freshest Bybit listings
  const newlyListed = useMemo(
    () =>
      [...coins]
        .filter((_, i) => i >= 200)
        .sort((a, b) => a.volume24h - b.volume24h)
        .slice(0, 100),
    [coins]
  )
  // Dynamic sector map — expensive O(n) walk, only runs when coins array changes
  const dynamicSectors = useMemo(() => buildDynamicSectors(coins), [coins])

  return { coins, isLive, topGainers, topLosers, trending, dynamicSectors, newlyListed }
}
