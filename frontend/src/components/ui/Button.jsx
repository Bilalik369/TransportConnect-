import { forwardRef } from "react"
import clsx from "clsx"
import LoadingSpinner from "./LoadingSpinner"

const Button = forwardRef(
  ({ children, className, variant = "primary", size = "medium", loading = false, disabled = false, ...props }, ref) => {
    const baseClasses =
      "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"

    const variants = {
      primary: "bg-primary text-white hover:bg-text-primary focus:ring-primary",
      secondary: "bg-text-secondary text-white hover:bg-primary focus:ring-text-secondary",
      outline: "border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary",
      ghost: "text-primary hover:bg-input-background focus:ring-primary",
      danger: "bg-error text-white hover:bg-red-600 focus:ring-error",
    }

    const sizes = {
      small: "px-3 py-2 text-sm",
      medium: "px-6 py-3 text-base",
      large: "px-8 py-4 text-lg",
    }

    return (
      <button
        ref={ref}
        className={clsx(
          baseClasses,
          variants[variant],
          sizes[size],
          (disabled || loading) && "opacity-50 cursor-not-allowed",
          className,
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <LoadingSpinner size="small" className="mr-2" />}
        {children}
      </button>
    )
  },
)

Button.displayName = "Button"

export default Button
