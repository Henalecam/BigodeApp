import Link from "next/link"
import { redirect } from "next/navigation"
import { getCurrentSession } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const reportLinks: Array<{
  title: string
  description: string
  href: "/relatorios/comissoes" | "/relatorios/faturamento"
}> = [
  {
    title: "Comissões",
    description: "Acompanhe comissões por barbeiro em períodos específicos.",
    href: "/relatorios/comissoes"
  },
  {
    title: "Faturamento",
    description: "Visualize o faturamento por forma de pagamento e barbeiro.",
    href: "/relatorios/faturamento"
  }
]

export default async function ReportsPage() {
  const session = await getCurrentSession()
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/")
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-primary">Relatórios</h1>
        <p className="text-sm text-neutral-500">Selecione um relatório para visualizar os indicadores do seu negócio.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {reportLinks.map(link => (
          <Card key={link.href} className="border-primary/10">
            <CardHeader>
              <CardTitle className="text-lg text-primary">{link.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-sm text-neutral-500">{link.description}</p>
              <div>
                <Button asChild>
                  <Link href={link.href}>Acessar relatório</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}




