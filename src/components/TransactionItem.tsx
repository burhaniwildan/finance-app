type Props = {
  name: string
  type: string
  amount: string
  color: string
}

export default function TransactionItem({ name, type, amount, color }: Props) {
  return (
    <div className="flex justify-between items-center border-b pb-2">
      <div>
        <p className="font-medium">{name}</p>
        <p className="text-sm text-gray-500">{type}</p>
      </div>
      <p className={`font-semibold ${color}`}>{amount}</p>
    </div>
  )
}