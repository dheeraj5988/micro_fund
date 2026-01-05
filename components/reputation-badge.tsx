import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface ReputationBadgeProps {
  score: number
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
}

function getReputationLevel(score: number) {
  if (score >= 701) {
    return { label: "Elite", color: "bg-emerald-100 text-emerald-700 border-emerald-200" }
  } else if (score >= 601) {
    return { label: "Trusted", color: "bg-blue-100 text-blue-700 border-blue-200" }
  } else {
    return { label: "New Borrower", color: "bg-amber-100 text-amber-700 border-amber-200" }
  }
}

export function ReputationBadge({ score, size = "md", showLabel = false }: ReputationBadgeProps) {
  const { label, color } = getReputationLevel(score)

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-sm px-2.5 py-1 gap-1.5",
    lg: "text-base px-3 py-1.5 gap-2",
  }

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }

  return (
    <div
      className={cn("inline-flex items-center rounded-full border font-medium", sizeClasses[size], color)}
      title={`Reputation Score: ${score} - ${label}`}
    >
      <Star className={cn(iconSizes[size], "fill-current")} />
      <span>{score}</span>
      {showLabel && <span className="ml-1">({label})</span>}
    </div>
  )
}
