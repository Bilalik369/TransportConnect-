import { forwardRef } from "react"
import clsx from "clsx"

const Input = forwardRef(({ label, error, className, ...props }, ref) => {
  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-semibold text-text-primary">{label}</label>}
      <input
        ref={ref}
        className={clsx("input-field", error && "border-error focus:ring-error", className)}
        {...props}
      />
      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  )
})

Input.displayName = "Input"

export default Input
