"use client"
import React, { useState, useEffect, useId, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

export const LayoutTextFlip = ({
  text = "Build Amazing",
  words = ["Landing Pages", "Component Blocks", "Page Sections", "3D Shaders"],
  duration = 3000,
  className,
  wordClassName,
}: {
  text: string
  words: string[]
  duration?: number
  className?: string
  wordClassName?: string
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const id = useId()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    // Clear any existing interval first
    if (intervalRef.current) clearInterval(intervalRef.current)

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length)
    }, duration)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [words.length, duration])

  return (
    <>
      <span
        className={cn(
          "text-2xl font-bold tracking-tight md:text-4xl",
          className
        )}
      >
        {text}
      </span>

      <span
        className={cn(
          "relative inline-flex w-fit overflow-hidden rounded-md border border-primary/20 bg-primary/5 px-4 py-2 font-sans text-2xl font-bold tracking-tight text-primary shadow-[0_0_30px_-5px_hsl(var(--primary)/0.3)] md:text-4xl",
          wordClassName
        )}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={`${id}-${currentIndex}`}
            initial={{ y: -40, filter: "blur(10px)", opacity: 0 }}
            animate={{
              y: 0,
              filter: "blur(0px)",
              opacity: 1,
            }}
            exit={{ y: 50, filter: "blur(10px)", opacity: 0 }}
            transition={{
              duration: 0.45,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            className={cn("inline-block whitespace-nowrap")}
          >
            {words[currentIndex]}
          </motion.span>
        </AnimatePresence>
      </span>
    </>
  )
}
