"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useCoinMarketData, formatUsdCompact, formatCountCompact } from "@/hooks/useCoinMarketData"

interface CoinDetailsPanelProps {
  selectedPair: string
}

function priceText(n: number | null): string {
  if (n === null) return "n/a"
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: n >= 1 ? 2 : 8 })}`
}

function pctText(n: number | null): string {
  if (n === null) return ""
  return `${n >= 0 ? "+" : ""}${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}%`
}

function dateText(iso: string | null): string {
  return iso ? iso.slice(0, 10) : ""
}

export function CoinDetailsPanel({ selectedPair }: CoinDetailsPanelProps) {
  const base = selectedPair.split("/")[0] || "BTC"
  const market = useCoinMarketData(base)
  const md = market.status === "ready" ? market.data : null

  if (!md) {
    const message =
      market.status === "missing"
        ? `CoinGecko has no coin with the ticker ${base}, so there's no market data to show for it.`
        : market.status === "error"
          ? market.message
          : `Loading ${base} market data from CoinGecko...`
    return (
      <ScrollArea className="h-full">
        <div className="p-6 text-xs text-muted-foreground">{message}</div>
      </ScrollArea>
    )
  }

  const circulationRate =
    md.circulatingSupply && (md.maxSupply || md.totalSupply)
      ? `${((md.circulatingSupply / (md.maxSupply || md.totalSupply || 1)) * 100).toFixed(2)}%`
      : "n/a"

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        {/* Information Section */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-4">Information</h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <InfoRow label="Ranking" value={md.rank ? `No.${md.rank}` : "Unranked"} />
            <InfoRow label="Market cap" value={formatUsdCompact(md.marketCap)} />
            <InfoRow label="Fully diluted market cap" value={formatUsdCompact(md.fdv)} />
            <InfoRow
              label="24h volume/market cap"
              value={md.volume24h && md.marketCap ? `${((md.volume24h / md.marketCap) * 100).toFixed(2)}%` : "n/a"}
            />
            <InfoRow label="Market share" value={md.marketSharePct !== null ? `${md.marketSharePct.toFixed(2)}%` : "n/a"} />
            <InfoRow label="24h volume (all markets)" value={formatUsdCompact(md.volume24h)} />
          </div>
        </div>

        {/* All-Time High/Low */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          <div>
            <div className="text-xs text-muted-foreground mb-1">All-time high (ATH)</div>
            <div className="text-sm font-medium text-foreground">{priceText(md.ath)}</div>
            <div className="text-xs text-muted-foreground">{dateText(md.athDate)}</div>
            <div className="text-xs text-trading-red mt-0.5">{pctText(md.athChangePct)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">All-time low (ATL)</div>
            <div className="text-sm font-medium text-foreground">{priceText(md.atl)}</div>
            <div className="text-xs text-muted-foreground">{dateText(md.atlDate)}</div>
            <div className="text-xs text-trading-green mt-0.5">{pctText(md.atlChangePct)}</div>
          </div>
        </div>

        {/* Tokenomics Section */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-4">Tokenomics</h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <InfoRow label="Circulating supply" value={`${formatCountCompact(md.circulatingSupply)} ${md.symbol}`} />
            <InfoRow label="Maximum supply" value={md.maxSupply ? `${formatCountCompact(md.maxSupply)} ${md.symbol}` : "No fixed cap"} />
            <InfoRow label="Total supply" value={`${formatCountCompact(md.totalSupply)} ${md.symbol}`} />
            <InfoRow label="Circulation rate" value={circulationRate} valueClassName="text-trading-green" />
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground/70 leading-relaxed">
          From CoinGecko, matched by ticker to {md.name} ({md.id})
          {md.updatedAt ? `, updated ${md.updatedAt.slice(0, 16).replace("T", " ")} UTC` : ""}.{" "}
          <a
            href={`https://www.coingecko.com/en/coins/${md.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            View on CoinGecko
          </a>
        </p>
      </div>
    </ScrollArea>
  )
}

function InfoRow({
  label,
  value,
  valueClassName,
}: {
  label: string
  value: string
  valueClassName?: string
}) {
  return (
    <div>
      <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
      <div className={cn("text-sm font-medium", valueClassName || "text-foreground")}>{value}</div>
    </div>
  )
}
