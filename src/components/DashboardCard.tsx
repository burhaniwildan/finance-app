import { Card, CardContent } from "@/components/ui/card"

type Props = {
  title: string
  amount: string
  color: string
}

export default function DashboardCard({ title, amount, color }: Props) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-gray-500">{title}</p>
        <h2 className={`text-xl font-bold ${color}`}>{amount}</h2>
      </CardContent>
    </Card>
  )
}