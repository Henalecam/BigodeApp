import { redirect } from "next/navigation"
import { getCurrentSession } from "@/lib/auth"
import { getDb } from "@/lib/mock-db"
import { ProductsScreen } from "@/components/products/ProductsScreen"

export default async function ProductsPage() {
  const session = await getCurrentSession()
  if (!session?.user) {
    redirect("/login")
  }

  const db = getDb()
  const products = db.products
    .filter(p => p.barbershopId === session.user.barbershopId)
    .sort((a, b) => a.name.localeCompare(b.name))

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

