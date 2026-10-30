"use client"

import { useState } from "react"
import { Users, Plus, ArrowRightLeft, Wallet, MoreHorizontal, Trash2, Edit2, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface SubAccount {
  id: string
  name: string
  type: "spot" | "futures" | "margin"
  balanceUSDT: number
  balanceBTC: number
  balanceETH: number
  color: string
  created: string
}

export default function SubAccountsPage() {
  const [accounts, setAccounts] = useState<SubAccount[]>([
    { id: "main", name: "Main Account", type: "spot", balanceUSDT: 24850.32, balanceBTC: 0.4521, balanceETH: 3.218, color: "bg-primary", created: "2025-06-01" },
    { id: "futures-1", name: "Futures Trading", type: "futures", balanceUSDT: 12400.0, balanceBTC: 0.125, balanceETH: 0.0, color: "bg-trading-green", created: "2025-09-15" },
    { id: "margin-1", name: "Margin Account", type: "margin", balanceUSDT: 5200.5, balanceBTC: 0.0, balanceETH: 1.5, color: "bg-accent", created: "2026-01-20" },
  ])

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [newName, setNewName] = useState("")
  const [newType, setNewType] = useState<"spot" | "futures" | "margin">("spot")
  const [transferFrom, setTransferFrom] = useState("")
  const [transferTo, setTransferTo] = useState("")
  const [transferAmount, setTransferAmount] = useState("")
  const [transferAsset, setTransferAsset] = useState("USDT")
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  const totalUSDT = accounts.reduce((a, c) => a + c.balanceUSDT, 0)
  const totalBTC = accounts.reduce((a, c) => a + c.balanceBTC, 0)
  const totalETH = accounts.reduce((a, c) => a + c.balanceETH, 0)

  const handleCreate = () => {
    if (!newName.trim()) return
    const colors = ["bg-blue-500", "bg-fuchsia-500", "bg-cyan-500", "bg-amber-500"]
    const newAccount: SubAccount = {
      id: Date.now().toString(),
      name: newName,
      type: newType,
      balanceUSDT: 0,
      balanceBTC: 0,
      balanceETH: 0,
      color: colors[accounts.length % colors.length],
      created: new Date().toISOString().split("T")[0],
    }
    setAccounts((prev) => [...prev, newAccount])
    setNewName("")
    setNewType("spot")
    setShowCreateModal(false)
  }

  const handleTransfer = () => {
    const amount = parseFloat(transferAmount)
    if (!transferFrom || !transferTo || isNaN(amount) || amount <= 0) return
    const assetKey = transferAsset === "USDT" ? "balanceUSDT" : transferAsset === "BTC" ? "balanceBTC" : "balanceETH"
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === transferFrom) return { ...acc, [assetKey]: Math.max(0, acc[assetKey] - amount) }
        if (acc.id === transferTo) return { ...acc, [assetKey]: acc[assetKey] + amount }
        return acc
      })
    )
    setTransferAmount("")
    setShowTransferModal(false)
  }

  const handleDelete = (id: string) => {
    if (id === "main") return
    setAccounts((prev) => prev.filter((a) => a.id !== id))
    setOpenMenu(null)
  }

  const typeLabels: Record<string, string> = { spot: "Spot", futures: "Futures", margin: "Margin" }
  const typeColors: Record<string, string> = { spot: "text-primary", futures: "text-trading-green", margin: "text-accent" }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Sub Accounts</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Create sub accounts and transfer funds between them for portfolio segregation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTransferModal(true)}
            className="flex items-center gap-2 rounded-lg border border-border/50 bg-card px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary transition-colors"
          >
            <ArrowRightLeft className="h-4 w-4" />
            Transfer
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-[0_0_20px_-5px_hsl(var(--primary)/0.3)]"
          >
            <Plus className="h-4 w-4" />
            New Account
          </button>
        </div>
      </div>

      {/* Total Portfolio */}
      <div className="rounded-2xl border border-border/50 bg-card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Wallet className="h-6 w-6 text-primary" />
          </div>
          <div>
            <span className="text-sm font-bold text-foreground">Total Portfolio</span>
            <p className="text-xs text-muted-foreground">Across all accounts</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl bg-secondary/30 p-4">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">USDT</div>
            <div className="text-lg font-bold font-mono text-foreground">
              ${totalUSDT.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="rounded-xl bg-secondary/30 p-4">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">BTC</div>
            <div className="text-lg font-bold font-mono text-foreground">{totalBTC.toFixed(4)}</div>
          </div>
          <div className="rounded-xl bg-secondary/30 p-4">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">ETH</div>
            <div className="text-lg font-bold font-mono text-foreground">{totalETH.toFixed(3)}</div>
          </div>
        </div>
      </div>

      {/* Account Cards */}
      <div className="space-y-3">
        {accounts.map((account) => (
          <div key={account.id} className="rounded-xl border border-border/50 bg-card p-6 transition-all hover:border-border group">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className={cn("h-3 w-3 rounded-full", account.color)} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">{account.name}</span>
                    <span className={cn("rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold capitalize", typeColors[account.type])}>
                      {typeLabels[account.type]}
                    </span>
                    {account.id === "main" && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">Primary</span>
                    )}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">Created {account.created}</div>
                </div>
              </div>
              {account.id !== "main" && (
                <div className="relative">
                  <button
                    onClick={() => setOpenMenu(openMenu === account.id ? null : account.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary transition-colors"
                  >
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                  </button>
                  {openMenu === account.id && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setOpenMenu(null)} />
                      <div className="absolute right-0 top-full mt-1 z-50 w-40 rounded-xl border border-border/50 bg-card shadow-xl p-1">
                        <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-foreground hover:bg-secondary transition-colors">
                          <Edit2 className="h-3.5 w-3.5" /> Rename
                        </button>
                        <button
                          onClick={() => handleDelete(account.id)}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">USDT</div>
                <div className="text-sm font-bold font-mono text-foreground">
                  {account.balanceUSDT.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">BTC</div>
                <div className="text-sm font-bold font-mono text-foreground">{account.balanceBTC.toFixed(4)}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">ETH</div>
                <div className="text-sm font-bold font-mono text-foreground">{account.balanceETH.toFixed(3)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <>
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md rounded-2xl border border-border/50 bg-card shadow-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-foreground">Create Sub Account</h3>
              <button onClick={() => setShowCreateModal(false)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary transition-colors">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Account Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g., DCA Strategy"
                  className="w-full rounded-lg border border-border/50 bg-secondary/50 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Account Type</label>
                <div className="flex gap-2">
                  {(["spot", "futures", "margin"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setNewType(type)}
                      className={cn(
                        "flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium capitalize transition-all",
                        newType === type
                          ? "border-primary/50 bg-primary/10 text-primary"
                          : "border-border/50 bg-card text-muted-foreground hover:bg-secondary"
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => setShowCreateModal(false)} className="rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Cancel
              </button>
              <button onClick={handleCreate} disabled={!newName.trim()} className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">
                Create
              </button>
            </div>
          </div>
        </>
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <>
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={() => setShowTransferModal(false)} />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md rounded-2xl border border-border/50 bg-card shadow-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-foreground">Transfer Funds</h3>
              <button onClick={() => setShowTransferModal(false)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary transition-colors">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">From</label>
                <select value={transferFrom} onChange={(e) => setTransferFrom(e.target.value)} className="w-full rounded-lg border border-border/50 bg-secondary/50 px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary/50 transition-colors">
                  <option value="">Select account</option>
                  {accounts.map((acc) => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                </select>
              </div>
              <div className="flex justify-center"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary"><ArrowRightLeft className="h-4 w-4 text-muted-foreground" /></div></div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">To</label>
                <select value={transferTo} onChange={(e) => setTransferTo(e.target.value)} className="w-full rounded-lg border border-border/50 bg-secondary/50 px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary/50 transition-colors">
                  <option value="">Select account</option>
                  {accounts.filter((a) => a.id !== transferFrom).map((acc) => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Amount</label>
                  <input type="number" value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} placeholder="0.00" className="w-full rounded-lg border border-border/50 bg-secondary/50 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 transition-colors" />
                </div>
                <div className="w-24">
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Asset</label>
                  <select value={transferAsset} onChange={(e) => setTransferAsset(e.target.value)} className="w-full rounded-lg border border-border/50 bg-secondary/50 px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/50 transition-colors">
                    <option value="USDT">USDT</option>
                    <option value="BTC">BTC</option>
                    <option value="ETH">ETH</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => setShowTransferModal(false)} className="rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              <button onClick={handleTransfer} disabled={!transferFrom || !transferTo || !transferAmount} className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">Transfer</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
