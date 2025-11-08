import { redirect } from "next/navigation"
import { getCurrentSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ProductsScreen } from "@/components/products/ProductsScreen"

export default async function ProductsPage() {
  const session = await getCurrentSession()
  if (!session?.user) {
    redirect("/login")
  }

  const products = await prisma.product.findMany({
    where: {
      barbershopId: session.user.barbershopId
    },
    orderBy: {
      name: "asc"
    }
  })

  const formatted = products.map(product => ({
    id: product.id,
    name: product.name,
    stock: product.stock,
    minStock: product.minStock,
    salePrice: product.salePrice,
    isActive: product.isActive
  }))

  return <ProductsScreen products={formatted} canManage={session.user.role === "ADMIN"} />
}

