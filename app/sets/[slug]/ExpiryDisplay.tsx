import { Progress } from "@/components/ui/progress"

interface ExpiryDisplayProps {
  daysRemaining: number
  totalDays: number
}

export function ExpiryDisplay({ daysRemaining, totalDays }: ExpiryDisplayProps) {
  const progress = Math.max(0, Math.min(100, (daysRemaining / totalDays) * 100))

  let statusColor = "text-green-600"
  let progressColor = ""

  if (daysRemaining <= 3) {
    statusColor = "text-red-600"
    progressColor = "bg-red-600"
  } else if (daysRemaining <= 7) {
    statusColor = "text-yellow-600"
    progressColor = "bg-yellow-600"
  }

  return (
    <div className="w-full max-w-sm my-4">
      <div className="flex justify-between items-center mb-2">
        <span className={`text-sm font-medium ${statusColor}`}>
          {daysRemaining > 0
            ? `Expires in ${daysRemaining} day${daysRemaining > 1 ? "s" : ""}`
            : "This set has expired."}
        </span>
        <span className="text-sm font-medium text-gray-500">{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} className={`h-2 ${progressColor}`} />
    </div>
  )
}

