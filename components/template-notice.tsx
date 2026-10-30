// A plain marker for pages that hold placeholder copy. AetherNode is a
// white-label template, so pages like Press and Careers show the layout an
// operator would fill in. This says so, so nobody reads the copy as fact.

export function TemplateNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-8 flex items-start gap-2.5 rounded-lg border border-border/50 bg-secondary/30 px-4 py-3">
      <span className="mt-px shrink-0 rounded bg-muted/70 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
        Template
      </span>
      <p className="text-xs leading-relaxed text-muted-foreground">{children}</p>
    </div>
  )
}
