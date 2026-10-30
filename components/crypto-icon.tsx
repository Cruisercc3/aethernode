"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

/**
 * Maps base ticker symbols to CoinGecko IDs for the CDN image URL.
 * CoinGecko CDN: https://assets.coingecko.com/coins/images/{id}/small/{slug}.png
 * We use a simpler approach: CoinGecko provides a deterministic URL via their
 * static assets CDN that maps coin symbols → images.
 *
 * We use the free CryptoCompare image CDN which maps symbols directly:
 * https://www.cryptocompare.com/media/... or the simpler symbol-based CDN.
 *
 * Best option: CoinIcons from the coins CDN — a symbol-based approach.
 */

// Use the CoinCap / CryptoFonts / token-icons CDN for reliable symbol-based logos
// This CDN serves SVG logos keyed by lowercase symbol
const LOGO_CDN = "https://assets.coincap.io/assets/icons"

// Fallback: some symbols need manual mapping to CoinGecko coin IDs
const COINGECKO_IDS: Record<string, string> = {
  BTC: "bitcoin", ETH: "ethereum", SOL: "solana", BNB: "binancecoin",
  XRP: "ripple", ADA: "cardano", DOGE: "dogecoin", AVAX: "avalanche-2",
  DOT: "polkadot", LINK: "chainlink", MATIC: "matic-network", UNI: "uniswap",
  LTC: "litecoin", ATOM: "cosmos", NEAR: "near", AAVE: "aave",
  FIL: "filecoin", APT: "aptos", ARB: "arbitrum", OP: "optimism",
  SHIB: "shiba-inu", TRX: "tron", ICP: "internet-computer", ETC: "ethereum-classic",
  INJ: "injective-protocol", SUI: "sui", SEI: "sei-network", TIA: "celestia",
  FET: "fetch-ai", RENDER: "render-token", JUP: "jupiter-exchange-solana",
  WIF: "dogwifcoin", PEPE: "pepe", STX: "blockstack", MKR: "maker",
  RUNE: "thorchain", ALGO: "algorand", GRT: "the-graph", FTM: "fantom",
  SAND: "the-sandbox", MANA: "decentraland", AXS: "axie-infinity",
  IMX: "immutable-x", GALA: "gala", ENJ: "enjincoin", CRV: "curve-dao-token",
  SNX: "havven", COMP: "compound-governance-token", GMX: "gmx",
  DYDX: "dydx", SUSHI: "sushi", TAO: "bittensor", BONK: "bonk",
  FLOKI: "floki", AR: "arweave", STORJ: "storj", MNT: "mantle",
  ONDO: "ondo-finance", EIGEN: "eigenlayer", BCH: "bitcoin-cash",
  XLM: "stellar", VET: "vechain", HBAR: "hedera-hashgraph",
  EGLD: "elrond-erd-2", XMR: "monero", ZEC: "zcash", DASH: "dash",
  NEO: "neo", EOS: "eos", CRO: "crypto-com-chain", FLOW: "flow",
  MINA: "mina-protocol", CHZ: "chiliz", KLAY: "klay-token",
  ROSE: "oasis-network", ONE: "harmony", CELO: "celo",
  AGIX: "singularitynet", OCEAN: "ocean-protocol", NMR: "numeraire",
  AKT: "akash-network", WLD: "worldcoin-wld",
  MOG: "mog-coin", POPCAT: "popcat", NOT: "notcoin",
  TON: "the-open-network", PYTH: "pyth-network", JTO: "jito-governance-token",
  TRU: "truefi", CFG: "centrifuge", LDO: "lido-dao", RPL: "rocket-pool",
  PENDLE: "pendle", STG: "stargate-finance", MAGIC: "magic",
  YGG: "yield-guild-games", "1INCH": "1inch",
  BRETT: "brett", BOME: "book-of-meme",
}

// Brand colors for fallback circles
const COIN_COLORS: Record<string, string> = {
  BTC: "#F7931A", ETH: "#627EEA", SOL: "#9945FF", BNB: "#F3BA2F", XRP: "#00AAE4",
  ADA: "#0033AD", DOGE: "#C2A633", AVAX: "#E84142", DOT: "#E6007A", LINK: "#2A5ADA",
  MATIC: "#8247E5", UNI: "#FF007A", LTC: "#BFBBBB", ATOM: "#2E3148", NEAR: "#00C08B",
  AAVE: "#B6509E", FIL: "#0090FF", APT: "#000000", ARB: "#28A0F0", OP: "#FF0420",
  SHIB: "#FFA409", TRX: "#FF0013", ICP: "#29ABE2", ETC: "#328332", INJ: "#00F2FE",
  SUI: "#4DA2FF", SEI: "#9B1CFF", TIA: "#7B2FBE", FET: "#1D2951", RENDER: "#000000",
  JUP: "#24AE8F", WIF: "#A06CD5", PEPE: "#479F53", STX: "#5546FF", MKR: "#1AAB9B",
  RUNE: "#33FF99", ALGO: "#000000", GRT: "#6747ED", FTM: "#1969FF", SAND: "#04ADEF",
}

function getImageUrl(base: string): string {
  // Primary: CoinCap CDN (symbol-based, very reliable)
  return `${LOGO_CDN}/${base.toLowerCase()}@2x.png`
}

function getFallbackUrl(base: string): string | null {
  const id = COINGECKO_IDS[base]
  if (!id) return null
  return `https://cdn.jsdelivr.net/gh/niclas3112/crypto-icons@latest/icons/${base.toLowerCase()}.png`
}

interface CryptoIconProps {
  base: string
  size?: "xs" | "sm" | "md" | "lg"
  className?: string
}

const SIZE_MAP = {
  xs: { dim: "h-4 w-4", text: "text-[7px]", px: 16 },
  sm: { dim: "h-5 w-5", text: "text-[8px]", px: 20 },
  md: { dim: "h-7 w-7", text: "text-[9px]", px: 28 },
  lg: { dim: "h-8 w-8", text: "text-[10px]", px: 32 },
}

export function CryptoIcon({ base, size = "md", className }: CryptoIconProps) {
  const [imgError, setImgError] = useState(0) // 0 = primary, 1 = fallback, 2 = text
  const s = SIZE_MAP[size]
  const color = COIN_COLORS[base] || "#888"

  if (imgError >= 2) {
    // Text fallback
    return (
      <div
        className={cn("flex items-center justify-center rounded-full font-bold shrink-0", s.dim, s.text, className)}
        style={{ backgroundColor: `${color}18`, border: `1px solid ${color}40` }}
      >
        <span style={{ color }}>{base.slice(0, 2)}</span>
      </div>
    )
  }

  const src = imgError === 0 ? getImageUrl(base) : getFallbackUrl(base)

  if (!src) {
    // No fallback URL, go straight to text
    return (
      <div
        className={cn("flex items-center justify-center rounded-full font-bold shrink-0", s.dim, s.text, className)}
        style={{ backgroundColor: `${color}18`, border: `1px solid ${color}40` }}
      >
        <span style={{ color }}>{base.slice(0, 2)}</span>
      </div>
    )
  }

  return (
    <div className={cn("relative shrink-0 rounded-full overflow-hidden", s.dim, className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={`${base} logo`}
        width={s.px}
        height={s.px}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover"
        onError={() => setImgError(prev => prev + 1)}
      />
    </div>
  )
}
