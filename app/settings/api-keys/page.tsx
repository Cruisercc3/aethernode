"use client"

import { useState } from "react"
import { Key, Plus, Copy, Eye, EyeOff, Trash2, CheckCircle2, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ApiKey {
  id: string
  label: string
  key: string
  secret: string
  permissions: string[]
  created: string
  lastUsed: string
  enabled: boolean
}

const PERMISSION_OPTIONS = [
  { id: "read", label: "Read", description: "View account data and market info" },
  { id: "trade", label: "Trade", description: "Execute buy and sell orders" },
  { id: "withdraw", label: "Withdraw", description: "Transfer funds out of account" },
  { id: "transfer", label: "Transfer", description: "Move funds between sub accounts" },
]

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([
    {
      id: "1",
      label: "Trading Bot Alpha",
      key: "demo_key_EXAMPLE_0001",
      secret: "demo_secret_NOT_A_REAL_KEY_0001",
      permissions: ["read", "trade"],
      created: "2025-12-15",
      lastUsed: "2 hours ago",
      enabled: true,
    },
    {
      id: "2",
      label: "Portfolio Tracker",
      key: "demo_key_EXAMPLE_0002",
      secret: "demo_secret_NOT_A_REAL_KEY_0002",
      permissions: ["read"],
      created: "2026-01-08",
      lastUsed: "5 days ago",
      enabled: true,
    },
  ])

  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  const [copied, setCopied] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newLabel, setNewLabel] = useState("")
  const [newPermissions, setNewPermissions] = useState<string[]>(["read"])

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const toggleSecret = (id: string) => {
    setShowSecrets((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleDelete = (id: string) => {
    setKeys((prev) => prev.filter((k) => k.id !== id))
  }

  const handleToggleKey = (id: string) => {
    setKeys((prev) => prev.map((k) => (k.id === id ? { ...k, enabled: !k.enabled } : k)))
  }

  const handleCreate = () => {
    if (!newLabel.trim()) return
    const newKey: ApiKey = {
      id: Date.now().toString(),
      label: newLabel,
      key: `demo_key_${Math.random().toString(36).slice(2, 14).toUpperCase()}`,
      secret: `demo_secret_NOT_A_REAL_KEY_${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      permissions: newPermissions,
      created: new Date().toISOString().split("T")[0],
      lastUsed: "Never",
      enabled: true,
    }
    setKeys((prev) => [...prev, newKey])
    setNewLabel("")
    setNewPermissions(["read"])
    setShowCreateModal(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">API Keys</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Create and manage API keys for programmatic trading access.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create Key
        </button>
      </div>

      {/* Warning */}
      <div className="flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
        <AlertTriangle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-foreground">Keep your secrets safe</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Never share your API secret keys. AetherNode staff will never ask for them.
          </p>
        </div>
      </div>

      {/* Keys List */}
      <div className="space-y-3">
        {keys.map((apiKey) => (
          <div
            key={apiKey.id}
            className={cn(
              "rounded-lg border bg-card p-5 transition-all",
              apiKey.enabled ? "border-border/50" : "border-border/30 opacity-60"
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <Key className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">{apiKey.label}</div>
                  <div className="text-[10px] text-muted-foreground">
                    Created {apiKey.created} · Last used {apiKey.lastUsed}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleKey(apiKey.id)}
                  className={cn(
                    "relative h-6 w-11 rounded-full shrink-0 transition-colors",
                    apiKey.enabled ? "bg-primary" : "bg-secondary"
                  )}
                >
                  <div
                    className={cn(
                      "absolute top-0.5 h-5 w-5 rounded-full bg-card shadow-sm transition-transform",
                      apiKey.enabled ? "translate-x-[22px]" : "translate-x-0.5"
                    )}
                  />
                </button>
                <button
                  onClick={() => handleDelete(apiKey.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Key and Secret Fields */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 rounded-md bg-secondary/50 px-3 py-2">
                <span className="text-[10px] font-semibold text-muted-foreground w-12">KEY</span>
                <code className="flex-1 text-xs font-mono text-foreground">{apiKey.key}</code>
                <button
                  onClick={() => handleCopy(apiKey.key, `key-${apiKey.id}`)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {copied === `key-${apiKey.id}` ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-trading-green" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
              <div className="flex items-center gap-2 rounded-md bg-secondary/50 px-3 py-2">
                <span className="text-[10px] font-semibold text-muted-foreground w-12">SECRET</span>
                <code className="flex-1 text-xs font-mono text-foreground">
                  {showSecrets[apiKey.id] ? apiKey.secret : "••••••••••••••••••••"}
                </code>
                <button
                  onClick={() => toggleSecret(apiKey.id)}
                  className="text-muted-foreground hover:text-foreground transition-colors mr-1"
                >
                  {showSecrets[apiKey.id] ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </button>
                <button
                  onClick={() => handleCopy(apiKey.secret, `secret-${apiKey.id}`)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {copied === `secret-${apiKey.id}` ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-trading-green" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Permissions */}
            <div className="flex items-center gap-1.5 mt-3">
              {apiKey.permissions.map((perm) => (
                <span
                  key={perm}
                  className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-muted-foreground capitalize"
                >
                  {perm}
                </span>
              ))}
            </div>
          </div>
        ))}

        {keys.length === 0 && (
          <div className="rounded-lg border border-dashed border-border/50 bg-card p-12 text-center">
            <Key className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground mb-1">No API Keys</p>
            <p className="text-xs text-muted-foreground">Create your first API key to get started with programmatic trading.</p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <>
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md rounded-lg border border-border/50 bg-card shadow-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Create API Key</h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Label</label>
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="e.g., Trading Bot"
                  className="w-full rounded-md border border-border/50 bg-secondary/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Permissions</label>
                <div className="space-y-2">
                  {PERMISSION_OPTIONS.map((perm) => (
                    <label key={perm.id} className="flex items-center gap-3 rounded-md p-2 hover:bg-secondary/50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={newPermissions.includes(perm.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewPermissions((prev) => [...prev, perm.id])
                          } else {
                            setNewPermissions((prev) => prev.filter((p) => p !== perm.id))
                          }
                        }}
                        className="h-4 w-4 rounded border-border accent-primary"
                      />
                      <div>
                        <div className="text-sm font-medium text-foreground">{perm.label}</div>
                        <div className="text-[10px] text-muted-foreground">{perm.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!newLabel.trim()}
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                Create Key
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
