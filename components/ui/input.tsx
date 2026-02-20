import * as React from "react"

import { cn } from "@/lib/utils"

function Input({
  className,
  type,
  maxLength,
  ref: forwardedRef,
  ...props
}: React.ComponentProps<"input">) {
  const [length, setLength] = React.useState(0)
  const innerRef = React.useRef<HTMLInputElement | null>(null)
  const showCounter = (type === "text" || !type) && maxLength != null

  const handleRef = React.useCallback(
    (el: HTMLInputElement | null) => {
      innerRef.current = el
      if (el && showCounter) setLength(el.value.length)
      if (typeof forwardedRef === "function") forwardedRef(el)
      else if (forwardedRef) forwardedRef.current = el
    },
    [forwardedRef, showCounter],
  )

  const inputElement = (
    <input
      ref={showCounter ? handleRef : forwardedRef}
      type={type}
      data-slot="input"
      maxLength={maxLength}
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        type === "number" &&
          "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
        className,
      )}
      {...props}
      {...(showCounter && {
        onInput: (e: React.FormEvent<HTMLInputElement>) => {
          setLength(e.currentTarget.value.length)
          props.onInput?.(e)
        },
        onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
          setLength(e.currentTarget.value.length)
          props.onFocus?.(e)
        },
      })}
    />
  )

  if (!showCounter) return inputElement

  return (
    <div className="relative">
      {inputElement}
      <span className="pointer-events-none absolute -bottom-5 right-0 text-[10px] tabular-nums text-muted-foreground">
        {length}/{maxLength}
      </span>
    </div>
  )
}

export { Input }
