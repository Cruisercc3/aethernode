"use client"

import { useRef } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { motion, useInView } from "framer-motion"
import { Button } from "@/components/ui/button"

/* ------------------------------------------------------------------ */
/*  Price converter: BTC price (k$) → SVG Y coordinate                */
/*  Range: 62,000 (bottom) – 70,500 (top), SVG height 220             */
/* ------------------------------------------------------------------ */
const p = (price: number) => Math.round(8 + ((70.5 - price) / 8.5) * 210)

/* ------------------------------------------------------------------ */
/*  Candles — pure oscillating random walk, no trend bias              */
/* ------------------------------------------------------------------ */
const CANDLES: { x: number; o: number; c: number; h: number; l: number; up: boolean }[] = [
  { x:   6, o:66.80, c:67.55, h:66.40, l:67.90, up:true  },
  { x:  13, o:67.55, c:66.70, h:66.35, l:67.95, up:false },
  { x:  20, o:66.70, c:67.40, h:66.30, l:67.80, up:true  },
  { x:  27, o:67.40, c:66.55, h:66.20, l:67.90, up:false },
  { x:  34, o:66.55, c:67.30, h:66.10, l:67.65, up:true  },
  { x:  41, o:67.30, c:66.40, h:66.05, l:67.70, up:false },
  { x:  48, o:66.40, c:67.80, h:66.00, l:68.10, up:true  },
  { x:  55, o:67.80, c:66.90, h:66.55, l:68.20, up:false },
  { x:  62, o:66.90, c:66.20, h:65.80, l:67.30, up:false },
  { x:  69, o:66.20, c:67.10, h:65.70, l:67.45, up:true  },
  { x:  76, o:67.10, c:68.00, h:66.80, l:68.35, up:true  },
  { x:  83, o:68.00, c:67.15, h:66.80, l:68.40, up:false },
  { x:  90, o:67.15, c:67.90, h:66.75, l:68.15, up:true  },
  { x:  97, o:67.90, c:67.10, h:66.70, l:68.30, up:false },
  { x: 104, o:67.10, c:65.80, h:65.50, l:67.50, up:false },
  { x: 111, o:65.80, c:66.60, h:65.40, l:66.90, up:true  },
  { x: 118, o:66.60, c:65.90, h:65.55, l:67.10, up:false },
  { x: 125, o:65.90, c:66.70, h:65.50, l:66.95, up:true  },
  { x: 132, o:66.70, c:65.80, h:65.40, l:67.10, up:false },
  { x: 139, o:65.80, c:66.95, h:65.35, l:67.20, up:true  },
  { x: 146, o:66.95, c:66.30, h:66.00, l:67.40, up:false },
  { x: 153, o:66.30, c:65.50, h:65.10, l:66.70, up:false },
  { x: 160, o:65.50, c:66.40, h:65.10, l:66.75, up:true  },
  { x: 167, o:66.40, c:65.60, h:65.25, l:66.85, up:false },
  { x: 174, o:65.60, c:64.80, h:64.40, l:66.00, up:false },
  { x: 181, o:64.80, c:65.70, h:64.35, l:65.95, up:true  },
  { x: 188, o:65.70, c:64.90, h:64.50, l:66.10, up:false },
  { x: 195, o:64.90, c:65.80, h:64.45, l:66.10, up:true  },
  { x: 202, o:65.80, c:64.70, h:64.30, l:66.20, up:false },
  { x: 209, o:64.70, c:65.60, h:64.30, l:65.90, up:true  },
  { x: 216, o:65.60, c:66.50, h:65.20, l:66.80, up:true  },
  { x: 223, o:66.50, c:65.40, h:65.05, l:66.90, up:false },
  { x: 230, o:65.40, c:64.60, h:64.20, l:65.80, up:false },
  { x: 237, o:64.60, c:65.50, h:64.15, l:65.80, up:true  },
  { x: 244, o:65.50, c:66.30, h:65.10, l:66.65, up:true  },
  { x: 251, o:66.30, c:65.20, h:64.85, l:66.70, up:false },
  { x: 258, o:65.20, c:64.40, h:63.95, l:65.60, up:false },
  { x: 265, o:64.40, c:65.30, h:64.00, l:65.60, up:true  },
  { x: 272, o:65.30, c:66.20, h:65.00, l:66.55, up:true  },
  { x: 279, o:66.20, c:65.30, h:64.90, l:66.60, up:false },
  { x: 286, o:65.30, c:64.50, h:64.05, l:65.70, up:false },
  { x: 293, o:64.50, c:65.40, h:64.10, l:65.75, up:true  },
  { x: 300, o:65.40, c:64.60, h:64.20, l:65.80, up:false },
  { x: 307, o:64.60, c:65.60, h:64.15, l:65.90, up:true  },
  { x: 314, o:65.60, c:66.50, h:65.30, l:66.85, up:true  },
  { x: 321, o:66.50, c:65.40, h:65.05, l:66.90, up:false },
  { x: 328, o:65.40, c:64.60, h:64.20, l:65.80, up:false },
  { x: 335, o:64.60, c:65.50, h:64.15, l:65.80, up:true  },
  { x: 342, o:65.50, c:66.40, h:65.10, l:66.75, up:true  },
  { x: 349, o:66.40, c:65.55, h:65.15, l:66.80, up:false },
  { x: 356, o:65.55, c:64.70, h:64.25, l:65.95, up:false },
  { x: 363, o:64.70, c:65.80, h:64.30, l:66.10, up:true  },
  { x: 370, o:65.80, c:64.90, h:64.50, l:66.20, up:false },
  { x: 377, o:64.90, c:66.10, h:64.50, l:66.45, up:true  },
  { x: 384, o:66.10, c:65.20, h:64.80, l:66.50, up:false },
  { x: 391, o:65.20, c:64.30, h:63.90, l:65.60, up:false },
  { x: 398, o:64.30, c:65.30, h:63.85, l:65.60, up:true  },
  { x: 405, o:65.30, c:66.20, h:64.90, l:66.55, up:true  },
  { x: 412, o:66.20, c:65.30, h:64.90, l:66.60, up:false },
  { x: 419, o:65.30, c:64.40, h:63.95, l:65.70, up:false },
  { x: 426, o:64.40, c:65.50, h:64.00, l:65.80, up:true  },
  { x: 433, o:65.50, c:64.60, h:64.15, l:65.90, up:false },
  { x: 440, o:64.60, c:65.70, h:64.20, l:66.00, up:true  },
  { x: 447, o:65.70, c:66.60, h:65.35, l:66.95, up:true  },
  { x: 454, o:66.60, c:65.50, h:65.10, l:67.00, up:false },
  { x: 461, o:65.50, c:64.60, h:64.15, l:65.90, up:false },
  { x: 468, o:64.60, c:65.70, h:64.20, l:66.00, up:true  },
  { x: 475, o:65.70, c:64.80, h:64.35, l:66.10, up:false },
  { x: 482, o:64.80, c:66.00, h:64.35, l:66.35, up:true  },
  { x: 489, o:66.00, c:65.10, h:64.65, l:66.40, up:false },
  { x: 496, o:65.10, c:64.20, h:63.75, l:65.50, up:false },
  { x: 503, o:64.20, c:65.30, h:63.80, l:65.65, up:true  },
  { x: 510, o:65.30, c:66.40, h:64.90, l:66.75, up:true  },
  { x: 517, o:66.40, c:65.30, h:64.90, l:66.80, up:false },
  { x: 524, o:65.30, c:64.30, h:63.90, l:65.70, up:false },
  { x: 531, o:64.30, c:65.50, h:63.85, l:65.80, up:true  },
  { x: 538, o:65.50, c:64.60, h:64.15, l:65.90, up:false },
  { x: 545, o:64.60, c:65.80, h:64.20, l:66.15, up:true  },
  { x: 552, o:65.80, c:64.70, h:64.30, l:66.20, up:false },
  { x: 559, o:64.70, c:63.90, h:63.50, l:65.10, up:false },
  { x: 566, o:63.90, c:65.00, h:63.50, l:65.30, up:true  },
  { x: 573, o:65.00, c:64.10, h:63.65, l:65.40, up:false },
  { x: 580, o:64.10, c:65.20, h:63.70, l:65.55, up:true  },
  { x: 587, o:65.20, c:64.30, h:63.90, l:65.60, up:false },
]

const VOLUME_BARS = [
  { h:42, up:true  }, { h:55, up:false }, { h:38, up:true  }, { h:60, up:false },
  { h:32, up:true  }, { h:48, up:false }, { h:72, up:true  }, { h:50, up:false },
  { h:28, up:false }, { h:45, up:true  }, { h:80, up:true  }, { h:62, up:false },
  { h:35, up:true  }, { h:58, up:false }, { h:85, up:false }, { h:40, up:true  },
  { h:30, up:false }, { h:44, up:true  }, { h:36, up:false }, { h:68, up:true  },
  { h:52, up:false }, { h:75, up:false }, { h:65, up:true  }, { h:42, up:false },
  { h:38, up:false }, { h:55, up:true  }, { h:48, up:false }, { h:70, up:false },
  { h:60, up:true  }, { h:45, up:true  }, { h:72, up:true  }, { h:58, up:false },
  { h:30, up:false }, { h:40, up:false }, { h:52, up:true  }, { h:38, up:true  },
  { h:66, up:false }, { h:48, up:false }, { h:42, up:true  }, { h:55, up:true  },
  { h:70, up:false }, { h:35, up:false }, { h:60, up:true  }, { h:45, up:false },
  { h:28, up:false }, { h:75, up:true  }, { h:62, up:true  }, { h:50, up:false },
  { h:40, up:false }, { h:55, up:true  }, { h:38, up:false }, { h:48, up:true  },
  { h:78, up:false }, { h:32, up:false }, { h:65, up:true  }, { h:72, up:true  },
  { h:55, up:false }, { h:42, up:false }, { h:30, up:true  }, { h:58, up:false },
  { h:80, up:true  }, { h:44, up:false }, { h:68, up:true  }, { h:52, up:false },
  { h:36, up:false }, { h:70, up:true  }, { h:48, up:false }, { h:85, up:true  },
  { h:40, up:false }, { h:28, up:false }, { h:62, up:true  }, { h:55, up:true  },
  { h:45, up:false }, { h:72, up:false }, { h:38, up:true  }, { h:60, up:false },
  { h:50, up:true  }, { h:42, up:false }, { h:78, up:true  }, { h:35, up:false },
  { h:66, up:true  }, { h:48, up:false }, { h:30, up:false }, { h:55, up:true  },
]

const ASKS = [
  { price: "68,905.5", qty: "0.04100", total: "2.74500" },
  { price: "68,905.4", qty: "0.06200", total: "2.70400" },
  { price: "68,905.3", qty: "0.04800", total: "2.64200" },
  { price: "68,905.2", qty: "0.03600", total: "2.59400" },
  { price: "68,905.1", qty: "0.04200", total: "2.55800" },
  { price: "68,905.0", qty: "0.06800", total: "2.51600" },
]
const BIDS = [
  { price: "68,903.6", qty: "2.62700", total: "2.62700" },
  { price: "68,903.5", qty: "2.32300", total: "2.32300" },
  { price: "68,903.3", qty: "0.07200", total: "2.39500" },
  { price: "68,902.6", qty: "0.06200", total: "2.39800" },
  { price: "68,902.3", qty: "0.03000", total: "2.48000" },
  { price: "68,902.1", qty: "0.19600", total: "2.50900" },
]
const TICKER_PAIRS = [
  { s: "ETHUSDT",  p: "+3.13%", up: true  },
  { s: "SOLUSDT",  p: "+5.67%", up: true  },
  { s: "BNBUSDT",  p: "-4.45%", up: false },
  { s: "ADAUSDT",  p: "+3.12%", up: true  },
  { s: "DOGEUSDT", p: "-2.34%", up: false },
  { s: "XRPUSDT",  p: "+1.89%", up: true  },
  { s: "DOTUSDT",  p: "+4.56%", up: true  },
  { s: "AVAXUSDT", p: "+4.12%", up: true  },
  { s: "MATICUSDT",p: "+2.67%", up: true  },
  { s: "LINKUSDT", p: "+3.45%", up: true  },
  { s: "ATOMUSDT", p: "-1.58%", up: false },
  { s: "BTCUSDT",  p: "+2.34%", up: true  },
]
const PRICE_LABELS = ["70,000","69,000","68,000","67,000","66,000","65,000","64,000","63,000","62,500"]
const DRAW_TOOLS   = ["M","↗","⊡","◯","✎","⟨⟩","⌇","⊞"]

/* ------------------------------------------------------------------ */
/*  Full Terminal Mock                                                  */
/* ------------------------------------------------------------------ */
function FullTerminalMock() {
  return (
    <div
      className="rounded-xl border border-border/50 overflow-hidden shadow-2xl shadow-primary/10 w-full"
      style={{ background: "#0e1117", fontSize: "8px" }}
    >
      {/* Browser chrome */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-white/[0.06]" style={{ background: "#161b22" }}>
        <div className="flex gap-1">
          <div className="h-2 w-2 rounded-full bg-destructive/70" />
          <div className="h-2 w-2 rounded-full bg-yellow-500/70" />
          <div className="h-2 w-2 rounded-full bg-trading-green/70" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-1.5 rounded bg-white/[0.05] px-3 py-0.5 text-[10px] text-white/40 font-mono">
            <span className="text-trading-green/80">https://</span>app.aethernode.io/futures
          </div>
        </div>
      </div>

      {/* AetherNode top nav */}
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-white/[0.06]" style={{ background: "#0d1117" }}>
        <div className="flex items-center gap-4">
          <span className="font-bold text-white tracking-tight text-[11px]">AetherNode</span>
          {["Spot", "Futures", "Markets", "Analytics", "Wallet", "Dashboard"].map((item, i) => (
            <span key={item} className={`text-[9px] font-medium ${i === 1 ? "text-primary" : "text-white/50"}`}>{item}</span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded px-2 py-0.5 text-[8px] text-white/50 border border-white/10">Connect Wallet</div>
          <div className="rounded px-2 py-0.5 text-[8px] text-white font-semibold" style={{ background: "#f97316" }}>Sign Up</div>
        </div>
      </div>

      {/* Scrolling ticker bar */}
      <div className="flex items-center gap-4 px-4 py-[3px] border-b border-white/[0.05] overflow-hidden" style={{ background: "#0d1117" }}>
        {TICKER_PAIRS.map((t) => (
          <span key={t.s} className="whitespace-nowrap flex-shrink-0 font-mono text-[7px]">
            <span className="text-white/40">{t.s}</span>
            <span className={`ml-1 ${t.up ? "text-trading-green" : "text-trading-red"}`}>{t.p}</span>
          </span>
        ))}
      </div>

      {/* BTC/USDT instrument info bar */}
      <div className="flex items-center gap-3 px-4 py-1.5 border-b border-white/[0.06]" style={{ background: "#0d1117" }}>
        <span className="font-bold text-white text-[10px]">BTC/USDT</span>
        <span className="text-white/40 text-[7px]">Perpetual</span>
        <span className="h-1.5 w-1.5 rounded-full bg-trading-green" />
        <span className="font-bold font-mono text-[12px]" style={{ color: "#0ecb81" }}>68,903.6</span>
        <span className="text-trading-green font-mono text-[7px]">+4.89%</span>
        <span className="text-white/30 text-[7px]">Mark <span className="text-white/50 font-mono">68,983.5</span></span>
        <span className="text-white/30 text-[7px]">Index <span className="text-white/50 font-mono">68,921.2</span></span>
        <span className="text-white/30 text-[7px]">24h high <span className="text-white/50 font-mono">70,180.8</span></span>
        <span className="text-white/30 text-[7px]">24h low <span className="text-white/50 font-mono">65,234.4</span></span>
        <span className="text-white/30 text-[7px]">24h vol <span className="text-white/50 font-mono">277,095 BTC</span></span>
        <div className="ml-auto flex items-center gap-2 text-[7px]">
          <span className="text-white/30">Funding/Countdown</span>
          <span className="text-trading-red font-mono">-0.0005%</span>
          <span className="text-white/40 font-mono">00:12:18</span>
        </div>
      </div>

      {/* Chart sub-tabs + timeframe selector */}
      <div className="flex items-center gap-4 px-4 py-1 border-b border-white/[0.06]" style={{ background: "#0d1117" }}>
        {["Chart", "About", "News", "Trading data"].map((t, i) => (
          <span key={t} className={`text-[8px] pb-0.5 ${i === 0 ? "text-white border-b border-primary" : "text-white/40"}`}>{t}</span>
        ))}
        <div className="ml-4 flex items-center gap-1">
          {["1m","5m","15m","30m","1H","4H","1D","1W"].map((tf) => (
            <span key={tf} className={`text-[7.5px] px-1.5 rounded ${tf === "1H" ? "bg-primary/20 text-primary font-semibold" : "text-white/40"}`}>{tf}</span>
          ))}
          <span className="ml-2 text-[7.5px] text-white/40">Indicators <span className="text-primary">①</span></span>
        </div>
        <div className="flex items-center gap-1 ml-2 text-[7px] text-white/40 font-mono">
          <span>BTC/USDT · 1H · Candlestick</span>
          <span className="ml-2 text-white/50">O <span className="text-trading-green">69,448.4</span></span>
          <span className="text-white/50">H <span className="text-trading-green">69,479.5</span></span>
          <span className="text-white/50">L <span className="text-trading-red">68,749.8</span></span>
          <span className="text-white/50">C <span className="text-trading-green">68,931.1</span></span>
        </div>
      </div>

      {/* Main terminal body */}
      <div className="flex" style={{ background: "#0d1117", minHeight: "320px" }}>

        {/* Left drawing toolbar */}
        <div className="flex flex-col items-center gap-1.5 px-1.5 py-2 border-r border-white/[0.06]" style={{ minWidth: "22px" }}>
          {DRAW_TOOLS.map((icon, i) => (
            <div key={i} className="flex h-5 w-5 items-center justify-center rounded text-white/25 text-[8px]">{icon}</div>
          ))}
        </div>

        {/* Chart column */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Full terminal screenshot — chart + order book + trade panel all from real image */}
          <div className="overflow-hidden" style={{ borderRadius: "0 0 4px 4px" }}>
            <img
              src="/trading-chart.png"
              alt="BTC/USDT live trading terminal"
              style={{
                display: "block",
                width: "100%",
                height: "auto",
                marginTop: "-4.8%",
                pointerEvents: "none",
                userSelect: "none",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Platform Showcase Section                                          */
/* ------------------------------------------------------------------ */
export function PlatformShowcase() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8 overflow-hidden">
      {/* Background ambient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-primary/3 blur-[150px] pointer-events-none" />

      <div className="relative text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
            See It In Action
          </p>
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Production Trading Infrastructure — Live on Mainnet
          </h2>
          <p className="mt-4 mx-auto max-w-2xl text-pretty text-muted-foreground leading-relaxed">
            500+ pairs. 25+ indicators. Real-time order books. AI analytics. Chart
            rendering optimized beyond production exchange speeds. Connected to Bybit
            for live perpetual futures data.
          </p>
        </motion.div>
      </div>

      {/* Full terminal mock */}
      <motion.div
        initial={{ opacity: 0, y: 40, rotateX: 8 }}
        animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
        transition={{ delay: 0.2, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative mx-auto max-w-5xl"
        style={{ perspective: "1200px" }}
      >
        <FullTerminalMock />
        {/* Glow */}
        <div className="absolute -bottom-10 inset-x-10 h-20 bg-primary/5 blur-[40px] rounded-full pointer-events-none" />
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mt-16 flex flex-col items-center gap-4"
      >
        <div className="flex gap-3">
          <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_30px_-5px_hsl(var(--primary)/0.3)]">
            <Link href="/platform">
              Launch Futures
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-border/60 bg-transparent text-foreground hover:bg-secondary">
            <Link href="/spot">Spot Trading</Link>
          </Button>
        </div>
      </motion.div>
    </section>
  )
}
