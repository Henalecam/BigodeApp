import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { formatCurrency } from "@/lib/utils"

type TopBarber = {
  id: string
  name: string
  totalAppointments: number
  totalRevenue: number
}

export function TopBarbersTable({ data }: { data: TopBarber[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Barbeiro</TableHead>
          <TableHead className="text-right">Atendimentos</TableHead>
          <TableHead className="text-right">Faturamento</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map(item => (
          <TableRow key={item.id}>
            <TableCell>{item.name}</TableCell>
            <TableCell className="text-right">{item.totalAppointments}</TableCell>
            <TableCell className="text-right">{formatCurrency(item.totalRevenue)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

