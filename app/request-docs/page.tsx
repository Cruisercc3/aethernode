"use client"

import { useState, type FormEvent } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { FileText, Clock, BookOpen, Monitor, ArrowRight, CheckCircle2, Loader2 } from "lucide-react"

type FormState = "idle" | "submitting" | "success" | "error"

export default function RequestDocsPage() {
  const [state, setState] = useState<FormState>("idle")
  const [errorMsg, setErrorMsg] = useState("")

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setState("submitting")
    setErrorMsg("")

    const form = e.currentTarget
    const data = new FormData(form)

    try {
      const res = await fetch("https://formspree.io/f/••••••••", {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      })

      if (res.ok) {
        setState("success")
      } else {
        const json = await res.json().catch(() => null)
        setErrorMsg(json?.errors?.map((err: { message: string }) => err.message).join(", ") || "Something went wrong. Please try again.")
        setState("error")
      }
    } catch {
      setErrorMsg("Network error. Please check your connection and try again.")
      setState("error")
    }
  }

  return (
    <div className="relative">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--border)/0.1)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border)/0.1)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

      <div className="relative mx-auto max-w-5xl px-6 py-16 lg:px-8 lg:py-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-12 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Documentation Request
            </span>
          </div>
          <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
            Request the Technical Package
          </h1>
          <p className="mt-4 mx-auto max-w-xl text-pretty text-base leading-relaxed text-muted-foreground">
            {"Receive the full architecture breakdown, deployment guide, and platform documentation. I'll respond within 24 hours."}
          </p>
          <div className="mx-auto mt-6 h-px w-16 bg-primary/40" />
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mx-auto max-w-lg"
        >
          <div className="rounded-2xl border border-border/50 bg-card/60 p-6 md:p-8">
            <AnimatePresence mode="wait">
              {state === "success" ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col items-center py-8 text-center"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 mb-5">
                    <CheckCircle2 className="h-7 w-7 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground mb-2">
                    Documentation request received
                  </h2>
                  <p className="text-sm text-muted-foreground mb-8 max-w-sm leading-relaxed">
                    {"Check your email within 24 hours. You'll receive the full technical documentation package including architecture breakdown, deployment guide, and platform walkthrough."}
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Link
                      href="/architecture"
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary/50 bg-primary/10 px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
                    >
                      View Architecture
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    <Link
                      href="/"
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      Back to Home
                    </Link>
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleSubmit}
                  className="flex flex-col gap-5"
                >
                  {/* Name */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Name <span className="text-primary">*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      placeholder="Your name"
                      className="rounded-lg border border-border/60 bg-background/50 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                    />
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Email <span className="text-primary">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="you@company.com"
                      className="rounded-lg border border-border/60 bg-background/50 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                    />
                  </div>

                  {/* Company / Project */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="company" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Company or Project
                    </label>
                    <input
                      id="company"
                      name="company"
                      type="text"
                      placeholder="Optional"
                      className="rounded-lg border border-border/60 bg-background/50 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                    />
                  </div>

                  {/* Use case */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="usecase" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {"What are you looking to build?"}
                    </label>
                    <textarea
                      id="usecase"
                      name="usecase"
                      rows={3}
                      placeholder="Briefly describe how you'd use the platform"
                      className="resize-none rounded-lg border border-border/60 bg-background/50 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                    />
                  </div>

                  {/* Error message */}
                  {state === "error" && errorMsg && (
                    <p className="text-xs text-destructive">{errorMsg}</p>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={state === "submitting"}
                    className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_30px_-5px_hsl(var(--primary)/0.3)]"
                  >
                    {state === "submitting" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Request Documentation"
                    )}
                  </button>

                  {/* Disclaimer */}
                  <p className="text-center text-[11px] leading-relaxed text-muted-foreground/60">
                    {"You'll receive the documentation package via email. All inquiries are confidential."}
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Info strip */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mx-auto mt-8 max-w-lg"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-0 sm:divide-x sm:divide-border/40">
            {[
              { icon: Clock, text: "Response within 24 hours" },
              { icon: BookOpen, text: "Full architecture documentation" },
              { icon: Monitor, text: "Live platform walkthrough available" },
            ].map((item) => (
              <div key={item.text} className="flex flex-1 items-center justify-center gap-2 py-2 sm:px-4">
                <item.icon className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                <span className="text-xs text-muted-foreground">{item.text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
