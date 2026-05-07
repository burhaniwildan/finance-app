import AddTransactionForm from "@/components/AddTransaction"
import Sidebar from "@/components/Sidebar"

export default function Page() {
  return (
    <div className="flex min-h-screen gap-2">
      <Sidebar />
      <AddTransactionForm />
    </div>
  )
}