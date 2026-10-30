'use client'

import { useState } from 'react'
import { Loader2, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WalletConnectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConnect: (address: string) => void
}

const WALLETS = [
  {
    id: 'metamask',
    name: 'MetaMask',
    badge: 'Popular',
    color: '#E2761B',
    icon: (
      <svg viewBox="0 0 40 40" className="h-8 w-8">
        <path fill="#E2761B" d="M37.5 20c0 9.665-7.835 17.5-17.5 17.5S2.5 29.665 2.5 20 10.335 2.5 20 2.5 37.5 10.335 37.5 20z"/>
        <path fill="#fff" d="M29.5 11.5l-7.2 5.4 1.3-3.2 5.9-2.2zM10.5 11.5l7.1 5.5-1.2-3.3-5.9-2.2zM26.8 25.4l-1.9 2.9 4.1 1.1 1.2-4-3.4 0zM9.8 25.4l-1.2 4 4.1-1.1-1.9-2.9h-1zM17.4 17.7l-1.2 1.8 4.2.2-.1-4.5-2.9 2.5zM22.6 17.7l-3-2.6-.1 4.6 4.2-.2-1.1-1.8z"/>
      </svg>
    ),
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    badge: null,
    color: '#3B99FC',
    icon: (
      <svg viewBox="0 0 40 40" className="h-8 w-8">
        <path fill="#3B99FC" d="M20 2.5C10.335 2.5 2.5 10.335 2.5 20S10.335 37.5 20 37.5 37.5 29.665 37.5 20 29.665 2.5 20 2.5z"/>
        <path fill="#fff" d="M12.5 16.5c4.1-4 10.9-4 15 0l.5.5c.2.2.2.5 0 .7l-1.7 1.6c-.1.1-.3.1-.4 0l-.7-.7c-2.9-2.8-7.6-2.8-10.5 0l-.7.7c-.1.1-.3.1-.4 0l-1.7-1.6c-.2-.2-.2-.5 0-.7l.6-.5zm18.5 3.5l1.5 1.5c.2.2.2.5 0 .7l-6.8 6.6c-.2.2-.5.2-.7 0l-4.8-4.7c0-.1-.1-.1-.2 0l-4.8 4.7c-.2.2-.5.2-.7 0l-6.8-6.6c-.2-.2-.2-.5 0-.7l1.5-1.5c.2-.2.5-.2.7 0l4.8 4.7c.1 0 .1 0 .2 0l4.8-4.7c.2-.2.5-.2.7 0l4.8 4.7c.1 0 .1 0 .2 0l4.8-4.7c.2-.2.5-.2.7 0z"/>
      </svg>
    ),
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    badge: null,
    color: '#0052FF',
    icon: (
      <svg viewBox="0 0 40 40" className="h-8 w-8">
        <path fill="#0052FF" d="M20 2.5C10.335 2.5 2.5 10.335 2.5 20S10.335 37.5 20 37.5 37.5 29.665 37.5 20 29.665 2.5 20 2.5z"/>
        <path fill="#fff" d="M20 10c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10-4.5-10-10-10zm-2.5 12.5h-2.5v-5h2.5v5zm7.5 0h-2.5v-5h2.5v5z"/>
      </svg>
    ),
  },
  {
    id: 'trust',
    name: 'Trust Wallet',
    badge: null,
    color: '#3375BB',
    icon: (
      <svg viewBox="0 0 40 40" className="h-8 w-8">
        <path fill="#3375BB" d="M20 2.5C10.335 2.5 2.5 10.335 2.5 20S10.335 37.5 20 37.5 37.5 29.665 37.5 20 29.665 2.5 20 2.5z"/>
        <path fill="#fff" d="M20 8c-1 0-10 4-10 4v10c0 6 10 10 10 10s10-4 10-10V12s-9-4-10-4zm0 3c.5 0 7 2.5 7 2.5v8c0 4-7 7-7 7s-7-3-7-7v-8s6.5-2.5 7-2.5z"/>
      </svg>
    ),
  },
  {
    id: 'phantom',
    name: 'Phantom',
    badge: 'Solana',
    color: '#AB9FF2',
    icon: (
      <svg viewBox="0 0 40 40" className="h-8 w-8">
        <path fill="#AB9FF2" d="M20 2.5C10.335 2.5 2.5 10.335 2.5 20S10.335 37.5 20 37.5 37.5 29.665 37.5 20 29.665 2.5 20 2.5z"/>
        <path fill="#fff" d="M28 18c0-4.4-3.6-8-8-8s-8 3.6-8 8c0 .6.1 1.2.2 1.8.5 2.5 2.2 4.5 4.5 5.5.5.2 1 .4 1.5.5.6.1 1.2.2 1.8.2s1.2-.1 1.8-.2c.5-.1 1-.3 1.5-.5 2.3-1 4-3 4.5-5.5.1-.6.2-1.2.2-1.8z"/>
      </svg>
    ),
  },
]

const MOCK_ADDRESS = '0x7a2F...8b3E'

export function WalletConnectModal({
  open,
  onOpenChange,
  onConnect,
}: WalletConnectModalProps) {
  const [connecting, setConnecting] = useState<string | null>(null)
  const [connected, setConnected] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null)

  const handleWalletClick = async (walletId: string) => {
    setConnecting(walletId)
    setSelectedWallet(walletId)

    await new Promise((resolve) => setTimeout(resolve, 2000))

    setConnecting(null)
    setConnected(true)
    onConnect(MOCK_ADDRESS)

    setTimeout(() => {
      onOpenChange(false)
      setConnected(false)
      setSelectedWallet(null)
    }, 1500)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 border-2 border-foreground/10 bg-card">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h2 className="text-sm font-mono font-semibold uppercase tracking-wider">Connect Wallet</h2>
          <button 
            onClick={() => onOpenChange(false)}
            className="flex h-7 w-7 items-center justify-center hover:bg-muted transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {connected && selectedWallet ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="relative">
                <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center border border-accent/30">
                  <Check className="h-8 w-8 text-accent" />
                </div>
              </div>
              <div className="text-center">
                <p className="font-mono font-semibold text-foreground">Connected</p>
                <p className="text-sm font-mono text-muted-foreground mt-1">{MOCK_ADDRESS}</p>
              </div>
            </div>
          ) : connecting ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <p className="text-center text-sm font-mono text-muted-foreground">
                Connecting to {WALLETS.find((w) => w.id === connecting)?.name}...
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {WALLETS.map((wallet) => (
                <button
                  key={wallet.id}
                  onClick={() => handleWalletClick(wallet.id)}
                  className="group flex items-center gap-4 p-3 border border-border/50 transition-all hover:border-primary/50 hover:bg-primary/5"
                >
                  <div 
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${wallet.color}15` }}
                  >
                    {wallet.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-mono font-semibold text-foreground">
                      {wallet.name}
                    </p>
                    {wallet.badge && (
                      <span className="inline-block mt-0.5 text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary font-mono">
                        {wallet.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-muted-foreground group-hover:text-primary transition-colors font-mono">
                    →
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {!connected && !connecting && (
          <div className="px-4 py-3 border-t border-border">
            <p className="text-[10px] font-mono text-muted-foreground text-center">
              By connecting, you agree to the Terms of Service
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
