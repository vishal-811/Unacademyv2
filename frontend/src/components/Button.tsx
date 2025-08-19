

interface CustomButtonProps {
  onClick: () => void
  //icon?: LucideIcon
  text?: string
  variant?: "default" | "outline"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  children : React.ReactNode
}

export function CustomButton({ onClick, text, variant = "default", size = "default", className = "" ,children}: CustomButtonProps) {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background"
  const variantStyles = {
    default:
      "bg-gradient-to-r from-teal-500 to-amber-500 text-white hover:from-teal-600 hover:to-amber-600 shadow-lg hover:shadow-xl",
      outline:
    "border border-teal-500 text-teal-500 hover:bg-teal-500 hover:text-white shadow-md hover:shadow-lg"
  }
  const sizeStyles = {
    default: "h-10 py-2 px-4",
    sm: "h-9 px-3",
    lg: "h-11 px-8",
    icon: "h-10 w-10"
  }

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
        {children}
      {/* <Icon className={size === "icon" ? "h-4 w-4" : "mr-2 h-4 w-4"} /> */}
      {text && size !== "icon" && text}
    </button>
  )
}
