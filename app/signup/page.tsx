"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Eye, EyeOff, ArrowRight, Check, User, Mail, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"

const requirements = [
  "At least 8 characters",
  "One uppercase letter",
  "One number or symbol",
]

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [agreed, setAgreed] = useState(false)

  const passChecks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9!@#$%^&*]/.test(password),
  ]

  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      {/* Ambient glows */}
      <div className="fixed top-[20%] right-[15%] h-[400px] w-[400px] rounded-full bg-primary/3 blur-[140px] pointer-events-none" />
      <div className="fixed bottom-[20%] left-[10%] h-[350px] w-[350px] rounded-full bg-accent/3 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative w-full max-w-md"
      >
        <div className="rounded-xl border border-border/50 bg-card shadow-xl shadow-primary/5 overflow-hidden">
          {/* Top accent line */}
          <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

          <div className="p-8">
            {/* Logo + title */}
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                <span className="font-mono text-lg font-bold text-primary">A</span>
              </div>
              <h1 className="text-xl font-bold text-foreground">Create your account</h1>
              <p className="mt-1.5 text-sm text-muted-foreground">Start trading on AetherNode in minutes</p>
            </div>

            {/* Social login */}
            <div className="space-y-2 mb-5">
              <button className="flex w-full items-center justify-center gap-3 rounded-lg border border-border/50 bg-secondary/40 py-2.5 text-sm font-medium text-foreground hover:bg-secondary/70 transition-colors">
                <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Google
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button className="flex items-center justify-center gap-2 rounded-lg border border-border/50 bg-secondary/40 py-2.5 text-sm font-medium text-foreground hover:bg-secondary/70 transition-colors">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.18 0-.36-.02-.53-.06.018-.18.04-.39.04-.56 0-1.12.535-2.22 1.235-3.02.396-.44.955-.83 1.58-1.12.616-.28 1.195-.42 1.79-.46.04.18.05.36.05.55zm4.565 17.02c-.04.13-.06.28-.1.44-.35 1.12-.87 2.16-1.54 3.07-.6.81-1.22 1.63-2.14 1.63-.82 0-1.36-.53-2.14-.55-.82-.01-1.37.49-2.2.55-.07 0-.14.01-.21.01-.73 0-1.4-.75-2.06-1.65-1.26-1.71-2.21-4.27-2.21-6.7 0-3.94 2.56-6.03 5.08-6.03.96 0 1.75.63 2.36.63.58 0 1.48-.67 2.59-.57.4.02 1.58.16 2.33 1.23-.06.04-1.39.82-1.39 2.44 0 1.92 1.69 2.59 1.72 2.6z"/></svg>
                  Apple
                </button>
                <button className="flex items-center justify-center gap-2 rounded-lg border border-border/50 bg-secondary/40 py-2.5 text-sm font-medium text-foreground hover:bg-secondary/70 transition-colors">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                  GitHub
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="relative mb-5">
              <div className="h-px bg-border/40" />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">or sign up with email</span>
            </div>

            {/* Form */}
            <form onSubmit={(e) => e.preventDefault()} className="space-y-3">
              {/* First & Last Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="firstName" className="mb-1 block text-xs font-medium text-foreground">First Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John"
                      className="w-full rounded-lg border border-border/50 bg-secondary/40 pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="lastName" className="mb-1 block text-xs font-medium text-foreground">Last Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      className="w-full rounded-lg border border-border/50 bg-secondary/40 pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="email" className="mb-1 block text-xs font-medium text-foreground">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-border/50 bg-secondary/40 pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="mb-1 block text-xs font-medium text-foreground">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    className="w-full rounded-lg border border-border/50 bg-secondary/40 pl-9 pr-10 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Password strength indicators */}
                {password.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-2 space-y-1"
                  >
                    {requirements.map((req, i) => (
                      <div key={req} className="flex items-center gap-2">
                        <div className={`flex h-3 w-3 items-center justify-center rounded-full transition-colors ${passChecks[i] ? "bg-[hsl(var(--trading-green))]" : "bg-secondary"}`}>
                          {passChecks[i] && <Check className="h-2 w-2 text-foreground" />}
                        </div>
                        <span className={`text-[10px] transition-colors ${passChecks[i] ? "text-foreground" : "text-muted-foreground"}`}>{req}</span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="mb-1 block text-xs font-medium text-foreground">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="w-full rounded-lg border border-border/50 bg-secondary/40 pl-9 pr-10 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirmPassword.length > 0 && (
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <div className={`flex h-3 w-3 items-center justify-center rounded-full ${passwordsMatch ? "bg-[hsl(var(--trading-green))]" : "bg-[hsl(var(--trading-red))]"}`}>
                      {passwordsMatch && <Check className="h-2 w-2 text-foreground" />}
                    </div>
                    <span className={`text-[10px] ${passwordsMatch ? "text-[hsl(var(--trading-green))]" : "text-[hsl(var(--trading-red))]"}`}>
                      {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                    </span>
                  </div>
                )}
              </div>

              {/* Terms */}
              <div className="flex items-start gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setAgreed(!agreed)}
                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all ${agreed ? "border-primary bg-primary" : "border-border/60 bg-secondary/40"}`}
                  aria-label="Agree to terms"
                >
                  {agreed && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
                </button>
                <span className="text-[11px] leading-relaxed text-muted-foreground">
                  I agree to the{" "}
                  <Link href="#" className="text-primary hover:underline">Terms of Service</Link>{" "}
                  and{" "}
                  <Link href="#" className="text-primary hover:underline">Privacy Policy</Link>
                </span>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_25px_-5px_hsl(var(--primary)/0.3)] transition-all hover:shadow-[0_0_35px_-5px_hsl(var(--primary)/0.5)]"
              >
                Create Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>

            {/* Footer */}
            <p className="mt-5 text-center text-xs text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">Sign in</Link>
            </p>
          </div>
        </div>

        {/* Security badge */}
        <div className="mt-4 flex items-center justify-center gap-2 text-muted-foreground">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="text-[11px]">256-bit SSL encrypted</span>
        </div>
      </motion.div>
    </div>
  )
}
