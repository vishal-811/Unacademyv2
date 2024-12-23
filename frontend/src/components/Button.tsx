import { LucideIcon } from 'lucide-react'

interface CustomButtonProps {
  onClick: () => void
  icon?: LucideIcon
  text?: string
  variant?: "default" | "outline"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  children : React.ReactNode
}

export function CustomButton({ onClick, icon: Icon, text, variant = "default", size = "default", className = "" ,children}: CustomButtonProps) {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background"
  const variantStyles = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: "border border-input hover:bg-accent hover:text-accent-foreground"
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
